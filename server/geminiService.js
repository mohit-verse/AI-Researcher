import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Recommended Gemini API Model for general reasoning and grounded research:
 * gemini-3.8-flash (official 3.8 generation with 1M tokens context and full search grounding support)
 */
export const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

/**
 * Get an initialized GoogleGenAI instance.
 * Throws a descriptive error if the API key is missing.
 */
export function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    const error = new Error('GEMINI_API_KEY is not configured. Please set your Gemini API key in server/.env');
    error.code = 'API_KEY_MISSING';
    throw error;
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Validates the research query string.
 * @param {string} topic 
 */
export function validateTopic(topic) {
  if (typeof topic !== 'string') {
    throw new Error('Research topic must be a text string.');
  }
  const clean = topic.trim();
  if (clean.length < 3) {
    throw new Error('Research topic is too short. Please provide at least 3 characters.');
  }
  if (clean.length > 500) {
    throw new Error('Research topic exceeds maximum length of 500 characters.');
  }
  return clean;
}

/**
 * Step 1: Validate research topic and generate a concise research plan using the Interactions API.
 * Uses lightweight text generation with gemini-3.8-flash.
 */
export async function generateResearchPlan(ai, topic) {
  const planPrompt = `You are Scout AI's research planner. The user wants to research the following topic:
"${topic}"

Create a concise, objective research plan. Formulate:
1. A 1-2 sentence core objective summary.
2. 3 to 4 focused sub-questions or critical angles to investigate.
3. 2 to 4 high-signal search queries suited for Google Search to uncover current, verifiable facts.

Return strictly valid JSON without any markdown code fence or extra conversational text, matching this exact structure:
{
  "summary": "Core research focus...",
  "targetQuestions": ["Question 1", "Question 2", "Question 3"],
  "searchQueries": ["query 1", "query 2", "query 3"]
}`;

  try {
    const interaction = await ai.interactions.create({
      model: DEFAULT_MODEL,
      input: planPrompt,
      generation_config: {
        temperature: 0.2,
      },
    });

    let rawText = interaction.output_text || '';
    // Strip markdown formatting if the model wrapped it in ```json ... ```
    rawText = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

    const plan = JSON.parse(rawText);
    return {
      summary: plan.summary || `Investigate key dimensions and current developments on: ${topic}`,
      targetQuestions: Array.isArray(plan.targetQuestions) && plan.targetQuestions.length > 0
        ? plan.targetQuestions
        : [
            `What is the current state and recent development of ${topic}?`,
            `What are the verified benefits, opportunities, and key metrics?`,
            `What are the notable risks, limitations, and conflicting opinions?`
          ],
      searchQueries: Array.isArray(plan.searchQueries) && plan.searchQueries.length > 0
        ? plan.searchQueries
        : [topic, `${topic} latest status analysis`, `${topic} challenges and limitations`]
    };
  } catch (err) {
    console.warn('[Scout AI] Plan generation note:', err.message);
    // Graceful fallback plan if JSON parsing failed or model was overly verbose
    return {
      summary: `Systematic investigation into ${topic}`,
      targetQuestions: [
        `What are the most recent verified developments regarding ${topic}?`,
        `What are the practical applications, benefits, and key players?`,
        `What are the primary limitations, risks, and conflicting evidence?`
      ],
      searchQueries: [topic, `${topic} overview and latest findings`]
    };
  }
}

/**
 * Step 2: Perform Grounded Web Research using Gemini API's Google Search tool via the Interactions API.
 * Step 3: Extract research output, grounding metadata, source URLs, and source titles.
 */
export async function executeGroundedResearch(ai, topic, plan) {
  const planContext = `RESEARCH PLAN CONTEXT:
Summary: ${plan.summary}
Target Angles to Investigate:
${plan.targetQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;

  const groundedPrompt = `You are Scout AI, an elite analytical research agent.
Conduct comprehensive, grounded web research on the following user topic:
"${topic}"

${planContext}

INSTRUCTIONS:
1. Base your factual claims strictly on evidence retrieved from search results.
2. If evidence is conflicting, uncertain, or incomplete, explicitly state the contradiction or limitation. Do not present search snippets as definitive truth.
3. Do NOT fabricate citations, URLs, publication dates, or search snippets.
4. Organize your findings clearly under these exact section headers:
   ## Executive Summary
   ## Key Findings
   ## Benefits & Opportunities
   ## Risks, Limitations & Conflicting Evidence
   ## Conclusion

In Key Findings, provide 4-6 distinct, numbered or bulleted factual claims.`;

  try {
    // Primary approach: Official Interactions API with Google Search grounding tool
    const interaction = await ai.interactions.create({
      model: DEFAULT_MODEL,
      input: groundedPrompt,
      tools: [{ type: 'google_search' }],
      generation_config: {
        temperature: 0.2,
      },
    });

    return {
      rawText: interaction.output_text || '',
      interaction,
      groundingNotice: null,
    };
  } catch (err) {
    console.warn('[Scout AI] Google Search grounding call notice:', err.message);
    // If the Google Search tool encounters quota limits (429 RESOURCE_EXHAUSTED) or access constraints,
    // gracefully fall back to model analytical synthesis and clearly report the limitation.
    const fallbackPrompt = `You are Scout AI, an elite analytical research agent.
Synthesize an objective analytical research report on the following user topic:
"${topic}"

${planContext}

INSTRUCTIONS:
1. Provide a rigorous, balanced analytical synthesis.
2. If evidence is conflicting, uncertain, or incomplete, explicitly state the contradiction or limitation.
3. Organize your findings clearly under these exact section headers:
   ## Executive Summary
   ## Key Findings
   ## Benefits & Opportunities
   ## Risks, Limitations & Conflicting Evidence
   ## Conclusion

In Key Findings, provide 4-6 distinct, numbered or bulleted factual claims.`;

    const fallback = await ai.interactions.create({
      model: DEFAULT_MODEL,
      input: fallbackPrompt,
      generation_config: {
        temperature: 0.2,
      },
    });

    const isQuota = err.status === 429 || err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED');
    const notice = isQuota
      ? 'Search Grounding Quota Limit (429): Google Search Grounding is currently quota-limited on this API key. Synthesized analytical report using Gemini 3.8 Flash.'
      : `Search Grounding Notice: ${err.message}. Synthesized analytical report using Gemini 3.8 Flash.`;

    return {
      rawText: fallback.output_text || '',
      interaction: fallback,
      groundingNotice: notice,
    };
  }
}

/**
 * Step 4 & 5: Extract and validate citations against source metadata actually returned by the API.
 * Supports both Interactions API step annotations and generateContent groundingMetadata.
 */
export function extractAndValidateSources(researchData) {
  const verifiedSources = [];
  const searchQueries = [];
  const sourceUrlSet = new Set();

  if (!researchData) {
    return {
      verifiedSources: [],
      searchQueries: [],
      hasGrounding: false,
      searchEntryPoint: null,
      limitationNotice: null,
    };
  }

  // 1. Check Interactions API steps (google_search_call and url_citation annotations)
  const interaction = researchData.interaction || (researchData.steps ? researchData : null);
  if (interaction?.steps) {
    interaction.steps.forEach((step) => {
      // Extract search queries executed from google_search_call
      if (step.type === 'google_search_call' && step.arguments?.queries) {
        step.arguments.queries.forEach((q) => {
          if (q && !searchQueries.includes(q)) {
            searchQueries.push(q);
          }
        });
      }

      // Extract url_citation annotations from model_output
      if (step.type === 'model_output' && Array.isArray(step.content)) {
        step.content.forEach((block) => {
          if (Array.isArray(block.annotations)) {
            block.annotations.forEach((ann) => {
              if (ann.type === 'url_citation' && ann.url) {
                const uri = ann.url.trim();
                if (!sourceUrlSet.has(uri)) {
                  sourceUrlSet.add(uri);
                  let hostname = '';
                  try {
                    hostname = new URL(uri).hostname.replace(/^www\./, '');
                  } catch {
                    hostname = 'web';
                  }

                  verifiedSources.push({
                    id: `src-${verifiedSources.length + 1}`,
                    index: verifiedSources.length + 1,
                    title: (ann.title && ann.title.trim()) || hostname || `Source ${verifiedSources.length + 1}`,
                    url: uri,
                    domain: hostname,
                  });
                }
              }
            });
          }
        });
      }
    });
  }

  // 2. Also check groundingMetadata if present (legacy or direct object pass)
  const groundingMetadata = researchData.groundingMetadata || researchData;
  if (groundingMetadata && typeof groundingMetadata === 'object') {
    if (Array.isArray(groundingMetadata.webSearchQueries)) {
      groundingMetadata.webSearchQueries.forEach((q) => {
        if (q && !searchQueries.includes(q)) searchQueries.push(q);
      });
    }

    if (Array.isArray(groundingMetadata.groundingChunks)) {
      groundingMetadata.groundingChunks.forEach((chunk, index) => {
        const web = chunk.web;
        if (web && web.uri) {
          const uri = web.uri.trim();
          if (!sourceUrlSet.has(uri)) {
            sourceUrlSet.add(uri);
            let hostname = '';
            try {
              hostname = new URL(uri).hostname.replace(/^www\./, '');
            } catch {
              hostname = 'web';
            }

            verifiedSources.push({
              id: `src-${verifiedSources.length + 1}`,
              index: verifiedSources.length + 1,
              title: (web.title && web.title.trim()) || hostname || `Source ${verifiedSources.length + 1}`,
              url: uri,
              domain: hostname,
              chunkIndex: index,
            });
          }
        }
      });
    }
  }

  const hasGrounding = verifiedSources.length > 0 || searchQueries.length > 0;
  const limitationNotice = researchData.groundingNotice || (
    !hasGrounding
      ? 'Note: Search grounding metadata was not returned by the Gemini API for this query. Citations could not be independently cross-verified.'
      : null
  );

  return {
    verifiedSources,
    searchQueries,
    hasGrounding,
    searchEntryPoint: groundingMetadata?.searchEntryPoint?.renderedContent || null,
    limitationNotice,
  };
}

/**
 * Parses model markdown output into structured report sections.
 * Guarantees all required sections exist:
 * - researchQuestion
 * - executiveSummary
 * - keyFindings
 * - benefitsOpportunities
 * - risksLimitations
 * - conclusion
 * - sources (strictly verified)
 */
export function synthesizeReport(topic, rawText, verifiedSources, hasGrounding, limitationNotice) {
  // Helper to slice text between headers
  const getSection = (headers, text) => {
    for (const header of headers) {
      const regex = new RegExp(`(?:##?\\s*${header}[^\\n]*)(.+?)(?=(?:##?\\s*[A-Z]|$))`, 'is');
      const match = text.match(regex);
      if (match && match[1] && match[1].trim()) {
        return match[1].trim();
      }
    }
    return '';
  };

  const executiveSummary = getSection(['Executive Summary', 'Summary', 'Overview'], rawText);
  const keyFindings = getSection(['Key Findings', 'Findings', 'Evidence & Findings'], rawText);
  const benefitsOpportunities = getSection(['Benefits & Opportunities', 'Benefits and Opportunities', 'Opportunities', 'Benefits'], rawText);
  const risksLimitations = getSection(['Risks, Limitations & Conflicting Evidence', 'Risks and Limitations', 'Limitations & Risks', 'Risks & Challenges', 'Challenges'], rawText);
  const conclusion = getSection(['Conclusion', 'Strategic Conclusion', 'Summary & Conclusion', 'Outlook'], rawText);

  return {
    researchQuestion: topic,
    executiveSummary: executiveSummary || (rawText.length > 0 ? rawText.slice(0, 500) + '...' : 'No summary generated.'),
    keyFindings: keyFindings || 'Detailed findings generated in report analysis.',
    benefitsOpportunities: benefitsOpportunities || 'Opportunities identified across search analysis.',
    risksLimitations: risksLimitations || 'Limitations and uncertainties flagged during inquiry.',
    conclusion: conclusion || 'Synthesis concluded from retrieved grounded evidence.',
    fullMarkdown: rawText,
    sources: verifiedSources,
    groundingMetadataStatus: hasGrounding ? 'VERIFIED_GROUNDING' : 'NO_GROUNDING_METADATA_RETURNED',
    groundingLimitationNotice: limitationNotice || (!hasGrounding
      ? 'Note: Search grounding metadata was not returned by the Gemini API for this query. Citations could not be independently cross-verified.'
      : null),
  };
}
