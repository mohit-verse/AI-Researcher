import React, { useState } from 'react';

const PRESET_QUERIES = [
  { label: "Solid-state EV batteries by 2030", query: "Commercial viability and production timeline of solid-state EV batteries by 2030" },
  { label: "Generative AI regulatory rift: EU vs US", query: "Regulatory frameworks for generative AI models enforcement in EU vs US in 2026" },
  { label: "Ambient superconductor replications", query: "Recent advances in room temperature ambient pressure superconductor replications and validation" },
  { label: "GLP-1 agonists healthcare economics", query: "Impact of GLP-1 receptor agonists on healthcare economics and insurance coverage" },
];

export default function TopicInput({ onSubmit, isLoading, currentTopic }) {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (topic.trim().length >= 3 && !isLoading) {
      onSubmit(topic.trim());
    }
  };

  const handleSelectPreset = (query) => {
    setTopic(query);
    if (!isLoading) {
      onSubmit(query);
    }
  };

  const handleClear = () => {
    setTopic('');
  };

  const charCount = topic.length;
  const isValid = charCount >= 3 && charCount <= 500;

  return (
    <section className="w-full bg-surface-container-lowest border border-surface-container-high rounded-xl p-5 sm:p-7 shadow-xs">
      <div className="flex flex-col gap-5">
        {/* Header & Telemetry Parameters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-secondary mb-1">
              <span className="material-symbols-outlined text-[16px]">travel_explore</span>
              <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">Forensic Synthesis Rig</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              Investigative Synthesis Desk
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-surface-container-low p-1.5 rounded-lg text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-lowest shadow-2xs text-secondary font-medium">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-mono text-[11px]">Google Search Grounding</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-on-surface-variant font-mono text-[11px]">
              <span>Audit:</span>
              <span className="text-secondary font-semibold">Strict (Zero-Hallucination)</span>
            </div>
          </div>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-3 items-stretch">
          <div className="relative flex-1 bg-surface-container-lowest border border-surface-container-high focus-within:border-secondary rounded-xl shadow-2xs flex items-center p-2 transition-all">
            <span className="material-symbols-outlined text-outline ml-2 mr-2 text-[20px] flex-shrink-0">
              psychology_alt
            </span>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Investigate any question, market trend, scientific claim, or emerging policy..."
              disabled={isLoading}
              className="w-full bg-transparent text-primary placeholder:text-outline font-sans text-sm sm:text-base focus:outline-none disabled:opacity-60"
            />
            {topic && (
              <button
                type="button"
                onClick={handleClear}
                disabled={isLoading}
                className="p-1 rounded text-outline hover:text-primary transition-colors mr-1"
                title="Clear input"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
              </button>
            )}
            <span className="text-[11px] font-mono text-outline px-2 border-l border-surface-container-high hidden sm:inline">
              {charCount}/500
            </span>
          </div>

          <button
            type="submit"
            disabled={!isValid || isLoading}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all shadow-sm whitespace-nowrap active:scale-[0.99] ${
              !isValid || isLoading
                ? 'bg-surface-container text-outline cursor-not-allowed opacity-70'
                : 'bg-primary hover:bg-secondary text-white shadow-md'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Investigating Live...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[19px]">manage_search</span>
                <span>Initialize Grounded Research</span>
                <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-white/20 font-mono text-[10px]">↵</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Preset Query Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-surface-container-high/60">
          <span className="font-mono text-[10px] uppercase tracking-wider text-outline">
            Historical Benchmarks:
          </span>
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSelectPreset(preset.query)}
              className="text-xs px-3 py-1 rounded-full bg-surface-container hover:bg-secondary-container hover:text-on-secondary-container text-on-surface-variant font-medium transition-all text-left disabled:opacity-50"
            >
              • {preset.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
