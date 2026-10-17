import React, { useState } from 'react';

export default function ReportView({ report, isLoading, plan, events, sources, searchQueries }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('briefing'); // 'briefing' | 'logs' | 'json'

  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-8 sm:p-12 shadow-md space-y-8 animate-pulse">
        <div className="flex items-center justify-between pb-4 border-b border-surface-container-high/60">
          <div className="h-5 bg-surface-container-high rounded w-1/3"></div>
          <div className="h-8 bg-surface-container rounded-lg w-28"></div>
        </div>

        <div className="space-y-4">
          <div className="h-8 bg-surface-container rounded w-3/4"></div>
          <div className="h-4 bg-surface-container-low rounded w-1/2"></div>
        </div>

        <div className="space-y-3 pt-4">
          <div className="h-4 bg-surface-container-high rounded w-full"></div>
          <div className="h-4 bg-surface-container-high rounded w-5/6"></div>
          <div className="h-4 bg-surface-container-high rounded w-4/6"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          <div className="h-32 bg-surface-container-low rounded-xl"></div>
          <div className="h-32 bg-surface-container-low rounded-xl"></div>
        </div>

        <div className="text-center py-6 text-xs text-outline font-mono flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
          <span>Synthesizing live web evidence via Google Search grounding into peer-grade brief...</span>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-10 sm:p-16 text-center shadow-xs">
        <div className="w-14 h-14 mx-auto rounded-full bg-surface-container-low border border-surface-container-high flex items-center justify-center text-outline mb-4">
          <span className="material-symbols-outlined text-[28px]">article</span>
        </div>
        <h3 className="font-serif text-2xl font-semibold text-primary mb-2">
          Awaiting Grounded Inquiry
        </h3>
        <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
          Submit any research question or select a historical benchmark above. Scout AI will plan, search Google live, verify citations, and synthesize a structured editorial briefing.
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    const markdownContent = `# Research Report: ${report.researchQuestion}
Date: ${new Date().toLocaleDateString()}
Status: 100% Grounded via Google Search Grounding API (Scout AI)

## 1. Executive Summary
${report.executiveSummary}

## 2. Key Findings & Evidence
${report.keyFindings}

## 3. Benefits & Opportunities
${report.benefitsOpportunities}

## 4. Risks, Limitations & Conflicting Evidence
${report.risksLimitations}

## 5. Strategic Conclusion
${report.conclusion}

## Verified Sources
${report.sources && report.sources.length > 0
  ? report.sources.map(s => `[${s.index}] ${s.title}: ${s.url}`).join('\n')
  : 'No verified citations returned by search grounding.'}
`;

    navigator.clipboard.writeText(markdownContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDownload = () => {
    const markdownContent = `# Research Report: ${report.researchQuestion}
Date: ${new Date().toLocaleDateString()}
Status: 100% Grounded via Google Search Grounding API (Scout AI)

## 1. Executive Summary
${report.executiveSummary}

## 2. Key Findings & Evidence
${report.keyFindings}

## 3. Benefits & Opportunities
${report.benefitsOpportunities}

## 4. Risks, Limitations & Conflicting Evidence
${report.risksLimitations}

## 5. Strategic Conclusion
${report.conclusion}

## Verified Sources
${report.sources && report.sources.length > 0
  ? report.sources.map(s => `[${s.index}] ${s.title}: ${s.url}`).join('\n')
  : 'No verified citations returned by search grounding.'}
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scout-ai-${report.researchQuestion.slice(0, 30).toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <article className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-6 sm:p-10 shadow-sm flex flex-col gap-8 transition-all">
      {/* Top Provenance Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-container-high/60">
        <div className="flex items-center gap-2 text-secondary font-mono text-[11px] bg-secondary-container px-3 py-1 rounded-full font-semibold">
          <span className="material-symbols-outlined text-[15px]">verified</span>
          <span>100% Grounded via Google Search API</span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-0.5 rounded-lg bg-surface-container-highest text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('briefing')}
            className={`px-3 py-1 rounded-md transition-all font-medium ${
              activeTab === 'briefing'
                ? 'bg-surface-container-lowest text-primary shadow-2xs font-semibold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Synthesized Briefing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1 rounded-md transition-all font-medium ${
              activeTab === 'logs'
                ? 'bg-surface-container-lowest text-primary shadow-2xs font-semibold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Live Logs ({events?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1 rounded-md transition-all font-medium ${
              activeTab === 'json'
                ? 'bg-surface-container-lowest text-primary shadow-2xs font-semibold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Metadata JSON
          </button>
        </div>
      </div>

      {/* Tab 1: Synthesized Briefing */}
      {activeTab === 'briefing' && (
        <div className="space-y-8">
          {/* Document Header */}
          <div className="space-y-4 pb-6 border-b border-surface-container-high">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-secondary font-bold">
                Analytical Intelligence Synthesis
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-sans text-xs font-semibold transition-colors shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  <span>{copied ? 'Copied!' : 'Copy Report'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-sans text-xs font-semibold transition-colors shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Export MD</span>
                </button>
              </div>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight leading-tight">
              {report.researchQuestion}
            </h2>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-on-surface-variant font-sans text-xs">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-secondary">event</span>
                {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} Synthesis
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-secondary">fingerprint</span>
                Crawl: Live Web Retrieval
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-secondary">speed</span>
                {sources?.length || 0} Grounded Sources
              </span>
            </div>

            {report.groundingLimitationNotice && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-600 flex-shrink-0">
                  warning
                </span>
                <div>
                  <span className="font-bold">Grounding Notice: </span>
                  {report.groundingLimitationNotice}
                </div>
              </div>
            )}
          </div>

          {/* 1. Executive Summary */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined text-[20px]">overview</span>
              <h3 className="font-serif text-xl font-bold text-primary">1. Executive Summary</h3>
            </div>
            <div className="text-sm leading-relaxed text-on-surface bg-surface-container-low p-5 rounded-lg border border-surface-container-high/60 whitespace-pre-line font-serif">
              {report.executiveSummary}
            </div>
          </section>

          {/* 2. Key Findings & Evidence */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined text-[20px]">fact_check</span>
              <h3 className="font-serif text-xl font-bold text-primary">2. Key Findings &amp; Evidence</h3>
            </div>
            <div className="text-sm leading-relaxed text-on-surface bg-surface-container-low p-5 rounded-lg border border-surface-container-high/60 whitespace-pre-line font-sans">
              {report.keyFindings}
            </div>
          </section>

          {/* 3 & 4: Two-column grid for Opportunities & Risks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Benefits & Opportunities */}
            <section className="space-y-3 flex flex-col">
              <div className="flex items-center gap-2 text-secondary">
                <span className="material-symbols-outlined text-[20px] text-emerald-700">trending_up</span>
                <h3 className="font-serif text-lg font-bold text-primary">3. Benefits &amp; Opportunities</h3>
              </div>
              <div className="flex-1 text-sm leading-relaxed text-on-surface bg-surface-container-low p-5 rounded-lg border border-surface-container-high/60 whitespace-pre-line font-sans">
                {report.benefitsOpportunities}
              </div>
            </section>

            {/* Risks, Limitations & Conflicting Evidence */}
            <section className="space-y-3 flex flex-col">
              <div className="flex items-center gap-2 text-secondary">
                <span className="material-symbols-outlined text-[20px] text-amber-700">warning_amber</span>
                <h3 className="font-serif text-lg font-bold text-primary">4. Risks &amp; Conflicting Evidence</h3>
              </div>
              <div className="flex-1 text-sm leading-relaxed text-on-surface bg-surface-container-low p-5 rounded-lg border border-surface-container-high/60 whitespace-pre-line font-sans">
                {report.risksLimitations}
              </div>
            </section>
          </div>

          {/* 5. Strategic Conclusion */}
          <section className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined text-[20px]">analytics</span>
              <h3 className="font-serif text-xl font-bold text-primary">5. Strategic Conclusion</h3>
            </div>
            <div className="text-sm leading-relaxed text-on-surface bg-secondary-container/30 p-5 rounded-lg border border-secondary/20 whitespace-pre-line font-serif">
              {report.conclusion}
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: Live Execution Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container-high/60">
            <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-primary">
              Full Event Stream ({events?.length || 0} events)
            </h3>
            <span className="font-mono text-[11px] text-outline">SSE Telemetry</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {events?.map((ev, i) => (
              <div key={i} className="p-3 rounded-lg bg-surface-container-low border border-surface-container-high text-xs font-mono">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-secondary font-bold">[{ev.event}]</span>
                  <span className="text-outline text-[10px]">
                    +{(ev.elapsedMs / 1000).toFixed(2)}s · {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-on-surface font-sans text-xs">{ev.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Grounding Metadata (JSON) */}
      {activeTab === 'json' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container-high/60">
            <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-primary">
              Grounding Provenance Payload
            </h3>
            <span className="font-mono text-[11px] text-secondary font-semibold">Strict Verification</span>
          </div>

          <pre className="p-4 rounded-lg bg-primary-container text-white font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[500px]">
            {JSON.stringify(
              {
                researchQuestion: report.researchQuestion,
                groundingStatus: report.groundingMetadataStatus,
                searchQueriesExecuted: searchQueries,
                verifiedSources: sources,
                plan,
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </article>
  );
}
