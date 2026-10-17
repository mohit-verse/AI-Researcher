import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  DEFAULT_MODEL,
  getGenAIClient,
  validateTopic,
  generateResearchPlan,
  executeGroundedResearch,
  extractAndValidateSources,
  synthesizeReport,
} from './geminiService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../client/dist');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Simple in-memory rate limiter (15 requests per minute per IP)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 15;

function checkRateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const clientData = rateLimitMap.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (now > clientData.resetAt) {
    clientData.count = 0;
    clientData.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  clientData.count += 1;
  rateLimitMap.set(ip, clientData);

  if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSec = Math.ceil((clientData.resetAt - now) / 1000);
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait before submitting another research query.',
      retryAfterSeconds: retryAfterSec,
    });
  }

  next();
}

/**
 * Health check & configuration status
 */
app.get('/api/health', (req, res) => {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
  res.json({
    status: 'ok',
    hasApiKey,
    model: DEFAULT_MODEL,
    time: new Date().toISOString(),
  });
});

/**
 * Server-Sent Events (SSE) Endpoint for real-time grounded research streaming
 */
app.get('/api/research/stream', checkRateLimit, async (req, res) => {
  const rawTopic = req.query.topic;
  const startTime = Date.now();
  const events = [];

  // Set SSE response headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });
  res.flushHeaders?.();

  let isAborted = false;
  req.on('close', () => {
    isAborted = true;
  });

  const sendEvent = (eventType, data) => {
    if (isAborted) return;
    const eventPayload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      elapsedMs: Date.now() - startTime,
      ...data,
    };
    events.push(eventPayload);
    res.write(`event: ${eventType}\n`);
    res.write(`data: ${JSON.stringify(eventPayload)}\n\n`);
  };

  try {
    // 0. Validate Topic
    const topic = validateTopic(rawTopic);
    sendEvent('request_received', {
      message: `Request received for topic: "${topic}"`,
      topic,
    });

    // Verify API Key
    const ai = getGenAIClient();

    // 1. Generate Research Plan
    sendEvent('plan_started', {
      message: 'Generating targeted research plan and search queries...',
    });

    const plan = await generateResearchPlan(ai, topic);
    if (isAborted) return;

    sendEvent('plan_created', {
      message: 'Research plan formulated.',
      plan,
    });

    // 2. Perform Grounded Web Research via Google Search
    sendEvent('research_running', {
      message: 'Querying live web sources via Google Search grounding...',
      targetQueries: plan.searchQueries,
    });

    const researchResult = await executeGroundedResearch(ai, topic, plan);
    if (isAborted) return;

    // 3. Extract and Validate Grounding Metadata & Sources
    const { verifiedSources, searchQueries, hasGrounding, searchEntryPoint, limitationNotice } = extractAndValidateSources(
      researchResult
    );

    sendEvent('evidence_retrieved', {
      message: hasGrounding
        ? `Retrieved and verified ${verifiedSources.length} authentic source references.`
        : (limitationNotice || 'Web search completed (no external citation metadata returned).'),
      sourceCount: verifiedSources.length,
      searchQueriesExecuted: searchQueries,
      hasGrounding,
      limitationNotice,
    });

    // 4. Synthesize Final Structured Report
    sendEvent('synthesis_started', {
      message: 'Synthesizing verified findings into structured research report...',
    });

    const report = synthesizeReport(topic, researchResult.rawText, verifiedSources, hasGrounding, limitationNotice);

    sendEvent('synthesis_completed', {
      message: 'Research report synthesis finalized.',
    });

    // 5. Completion
    const totalElapsedMs = Date.now() - startTime;
    sendEvent('completed', {
      message: `Research successfully concluded in ${(totalElapsedMs / 1000).toFixed(2)}s.`,
      report,
      sources: verifiedSources,
      searchQueries,
      hasGrounding,
      searchEntryPoint,
      plan,
      totalElapsedMs,
    });

    res.write('event: done\ndata: {}\n\n');
    res.end();
  } catch (err) {
    console.error('[Scout AI Error]', err);
    const totalElapsedMs = Date.now() - startTime;
    sendEvent('failed', {
      message: err.message || 'An unexpected error occurred during research execution.',
      code: err.code || 'RESEARCH_EXECUTION_ERROR',
      totalElapsedMs,
    });
    res.write('event: done\ndata: {}\n\n');
    res.end();
  }
});

/**
 * Standard REST POST Endpoint for single-turn research
 */
app.post('/api/research', checkRateLimit, async (req, res) => {
  const startTime = Date.now();
  try {
    const topic = validateTopic(req.body.topic);
    const ai = getGenAIClient();

    // 1. Plan
    const plan = await generateResearchPlan(ai, topic);

    // 2. Search Grounding
    const researchResult = await executeGroundedResearch(ai, topic, plan);

    // 3. Extract & Validate
    const { verifiedSources, searchQueries, hasGrounding, searchEntryPoint, limitationNotice } = extractAndValidateSources(
      researchResult
    );

    // 4. Synthesize
    const report = synthesizeReport(topic, researchResult.rawText, verifiedSources, hasGrounding, limitationNotice);

    const totalElapsedMs = Date.now() - startTime;

    res.json({
      success: true,
      topic,
      plan,
      report,
      sources: verifiedSources,
      searchQueries,
      hasGrounding,
      searchEntryPoint,
      totalElapsedMs,
    });
  } catch (err) {
    console.error('[Scout AI REST Error]', err);
    res.status(err.code === 'API_KEY_MISSING' ? 401 : 400).json({
      success: false,
      error: err.message,
      code: err.code || 'BAD_REQUEST',
    });
  }
});

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('[Scout AI Unhandled Error]', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`[Scout AI] Server running at http://localhost:${PORT}`);
  console.log(`[Scout AI] Default Model: ${DEFAULT_MODEL}`);
  console.log(`[Scout AI] API Key Status: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Missing (set in server/.env)'}`);
});
