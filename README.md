# Scout AI — Grounded Research Agent

Scout AI is an autonomous, high-integrity analytical research agent web application. It takes a research question, formulates a targeted research plan, performs live web research grounded via the official Gemini API's Google Search tool (`@google/genai`), validates citations against authentic search metadata to prevent hallucinated URLs, and synthesizes an editorial, structured intelligence report with a real-time activity log.

---

## 1. Visual & Architectural Design

- **Editorial Workspace**: Premium publication aesthetic inspired by high-end research journals.
  - Palette: Charcoal (`#14171a`, `#1e2126`), warm off-white cream (`#fcfbf8`, `#f8f6f0`), and restrained olive accents (`#435840`, `#546b50`).
  - Typography: Serif headings (`Newsreader`/Georgia) paired with clean sans-serif body (`Inter`) and monospace telemetry badges (`JetBrains Mono`).
- **Real-Time Execution Timeline**: Server-Sent Events (SSE) stream the research stages with elapsed-time tracking, live queries, and source verification.
- **Strict Citation Integrity**: Only sources returned in the official Google Search grounding metadata are displayed as citations. Phantom and hallucinated URLs are strictly excluded.
- **Responsive Workspace**: Desktop side-by-side view (Left: Activity Timeline & Source Directory; Right: Report Viewer) with a responsive mobile tab switcher.

---

## 2. Technology Stack

- **Frontend**: React + Vite + Tailwind CSS + Modern ESM
- **Backend**: Node.js (v24) + Express + Server-Sent Events (SSE)
- **AI SDK**: Official `@google/genai` (v2.30.0) JavaScript SDK
- **Search Tool**: Gemini API's Google Search Grounding (`tools: [{ type: "google_search" }]`) via Interactions API
- **Model**: Default `gemini-3.8-flash` (configurable via `GEMINI_MODEL` in `.env`)
- **Zero Heavy Infrastructure**: No database, no vector DB, no local LLM, no Python service, no paid UI component libraries.

---

## 3. Core Research Workflow

```
[User Input] ──> [Validation] (3-500 chars)
       │
       ▼
[Stage 1: Planning] ──> Gemini generates 3-4 target questions & search queries
       │
       ▼
[Stage 2: Live Search Grounding] ──> Gemini + Google Search executes live web queries
       │
       ▼
[Stage 3: Evidence & Metadata Extraction] ──> Extract webSearchQueries & groundingChunks
       │
       ▼
[Stage 4: Citation Validation] ──> Cross-check citations, deduplicate, filter hallucinated URLs
       │
       ▼
[Stage 5: Synthesis] ──> Structure into 6 defined report sections
       │
       ▼
[Delivery via SSE] ──> Stream timeline events + final report to React UI
```

### Report Structure
1. **Research Question**: The analyzed prompt
2. **Executive Summary**: High-level synthesis of current state
3. **Key Findings**: 4-6 specific factual claims with citations
4. **Benefits & Opportunities**: Positive trends and realized advancements
5. **Risks, Limitations & Conflicting Evidence**: Unresolved uncertainties, controversies, and trade-offs
6. **Strategic Conclusion**: Forward-looking perspective
7. **Verified Sources**: Clickable links with domain badges directly extracted from grounding metadata

---

## 4. Quickstart & Installation

### Prerequisites
- Node.js (v18+ or v24+ recommended)
- npm (v9+)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Step 1: Install Dependencies
Run the install command from the root directory:
```bash
npm run install:all
```
*(Alternatively, run `npm install` inside both `server/` and `client/` directories.)*

### Step 2: Configure Environment Variables
Copy the example environment file in `server/`:
```bash
# On Windows PowerShell:
Copy-Item server/.env.example server/.env

# On Linux/macOS:
cp server/.env.example server/.env
```
Edit `server/.env` to include your Gemini API key:
```env
GEMINI_API_KEY=AIzaSyYourActualGeminiApiKeyHere
PORT=3001
# Optional: GEMINI_MODEL=gemini-3.8-flash
```

> **Security Note**: The API key is stored exclusively on the server in `server/.env` and is never exposed to client-side code or browser bundles.

### Step 3: Run the Application

#### Development Mode (Concurrent Server + Client)
```bash
npm run dev
```
- Frontend will open at: `http://localhost:5173`
- Backend API will run at: `http://localhost:3000`

#### Production Mode
Build the client and start the self-contained server:
```bash
npm run build
npm start
```
- The application will be served at: `http://localhost:3000`

---

## 5. Testing & Verification

Run the automated server and logic verification test suite:
```bash
npm test
```

### Verification Checks Performed:
- **Empty & Short Input Rejection**: Verifies strings < 3 chars trigger proper `400 Bad Request`.
- **Length Constraint Enforcement**: Verifies strings > 500 chars are rejected.
- **Grounding Metadata Parsing**: Verifies extraction of `webSearchQueries` and `groundingChunks`.
- **Deduplication**: Validates duplicate source URLs are merged into distinct citation cards.
- **Section Parsing & Fallbacks**: Verifies parsing of Executive Summary, Key Findings, Benefits, Risks/Limitations, and Conclusion.
- **Missing API Key Handling**: Verifies clear `401 Unauthorized` response with setup instructions when key is not configured.
- **Vite Production Build**: Confirmed 100% clean compilation with zero lint or bundling errors.

---

## 6. API Reference

### 1. `GET /api/health`
Returns server operational status, default model, and whether an API key is configured.
```json
{
  "status": "ok",
  "hasApiKey": true,
  "model": "gemini-3.8-flash",
  "time": "2026-10-17T09:27:15.196Z"
}
```

### 2. `GET /api/research/stream?topic={topic}`
Server-Sent Events (SSE) streaming endpoint.
Emits real-time progression events:
- `request_received`: Topic received and validated.
- `plan_started`: Research plan generation initiated.
- `plan_created`: Target questions and proposed queries emitted.
- `research_running`: Google Search grounding queries initiated.
- `evidence_retrieved`: Authentic sources verified and search queries returned.
- `synthesis_started`: Report generation in progress.
- `synthesis_completed`: Sections finalized.
- `completed`: Full report payload and sources emitted.
- `failed`: Clear error payload if execution failed.

### 3. `POST /api/research`
Standard REST endpoint accepting `{ "topic": "string" }` and returning the complete synthesized JSON object.

---

## 7. Security and Reliability Guarantees
- **In-memory Rate Limiting**: 15 requests/minute per client IP to prevent quota exhaustion.
- **Timeout Protection**: Guarded against runaway requests and network hangs.
- **No Hallucinated Citations**: Sources section is rendered purely from authentic `groundingMetadata`.
- **Input Sanitization**: Topic trimmed and bounded between 3 and 500 characters.
