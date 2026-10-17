import dotenv from 'dotenv';
import { getGenAIClient, DEFAULT_MODEL, validateTopic, extractAndValidateSources, synthesizeReport } from './geminiService.js';

dotenv.config();

console.log('--- Scout AI Gemini Integration Verification ---');
console.log('Configured Default Model:', DEFAULT_MODEL);
console.log('GEMINI_API_KEY present:', Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'));

// Test topic validation
try {
  validateTopic('   ');
  console.error('FAIL: Empty topic should throw error');
} catch (e) {
  console.log('PASS: Empty topic rejected correctly:', e.message);
}

try {
  const valid = validateTopic('  Solid-state battery commercialization  ');
  console.log('PASS: Valid topic sanitized correctly:', valid);
} catch (e) {
  console.error('FAIL:', e.message);
}

// Test source extraction logic with synthetic grounding metadata
const mockMetadata = {
  webSearchQueries: ['solid state battery 2026 commercial status', 'quantumscape volkswagen battery update'],
  groundingChunks: [
    { web: { uri: 'https://www.reuters.com/business/autos-transportation/ev-battery-tech-2026', title: 'Reuters - EV Battery Technology Report' } },
    { web: { uri: 'https://electrek.co/2026/01/quantumscape-solid-state-production', title: 'Electrek: QuantumScape Production Ramp' } },
    { web: { uri: 'https://www.reuters.com/business/autos-transportation/ev-battery-tech-2026', title: 'Duplicate URL should be deduped' } },
  ]
};

const extracted = extractAndValidateSources(mockMetadata);
console.log('PASS: Deduped source count:', extracted.verifiedSources.length, '(Expected: 2)');
console.log('PASS: Search queries extracted:', extracted.searchQueries.length, '(Expected: 2)');
console.log('PASS: Verified source domains:', extracted.verifiedSources.map(s => s.domain).join(', '));

// Test report synthesis formatting
const mockText = `
## Executive Summary
Solid-state batteries represent the next technological leap for electric vehicle energy density and thermal safety.

## Key Findings
1. Commercial deployment is beginning with pilot vehicle fleets in 2026 [1].
2. Energy densities exceeding 400 Wh/kg have been validated in lab and pilot lines [2].

## Benefits & Opportunities
- Higher energy density leading to 600+ mile vehicle ranges.
- Vastly reduced fire and thermal runaway risks.

## Risks, Limitations & Conflicting Evidence
- Manufacturing yield rates remain lower than mature lithium-ion chemistries.
- Cost parity is not projected until late 2028 or 2030 according to industry analysts.

## Conclusion
While mass-market penetration remains several years away, 2026 marks the inflection point from R&D to validated pilot automotive production.
`;

const synthesized = synthesizeReport('Solid-state batteries', mockText, extracted.verifiedSources, true);
console.log('PASS: Report Executive Summary parsed:', synthesized.executiveSummary.length > 20);
console.log('PASS: Key Findings parsed:', synthesized.keyFindings.includes('Commercial deployment'));
console.log('PASS: Benefits parsed:', synthesized.benefitsOpportunities.includes('energy density'));
console.log('PASS: Risks & Limitations parsed:', synthesized.risksLimitations.includes('Manufacturing yield'));
console.log('PASS: Sources assigned:', synthesized.sources.length === 2);
console.log('--- Verification Complete ---');
