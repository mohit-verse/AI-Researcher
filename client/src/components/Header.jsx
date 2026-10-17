import React from 'react';

export default function Header({ hasApiKey, model, activeNav = 'workspace', onNavChange }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-surface-container-lowest border-b border-surface-container-high px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Emblem & Branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-xs">
            <span className="material-symbols-outlined text-[18px]">travel_explore</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-primary">Scout AI</span>
            <span className="hidden sm:inline-flex items-center font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-semibold">
              Grounded Research Agent
            </span>
          </div>
        </div>

        {/* Model Indicator Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low border border-surface-container-high">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span className="font-mono text-[11px] text-secondary font-medium">{model || 'gemini-3.8-flash'} Active</span>
          <span className="text-outline text-[11px]">·</span>
          <span className="text-[11px] font-sans text-on-surface-variant">Search Grounded</span>
        </div>
      </div>

      {/* Center Nav Links */}
      <nav className="hidden md:flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-surface-container-high text-xs">
        <button
          onClick={() => onNavChange?.('workspace')}
          className={`px-3 py-1 rounded transition-colors font-medium ${
            activeNav === 'workspace'
              ? 'bg-surface-container-lowest text-primary shadow-2xs font-semibold'
              : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
          }`}
        >
          Workspace
        </button>
        <button
          onClick={() => onNavChange?.('corpus')}
          className={`px-3 py-1 rounded transition-colors font-medium ${
            activeNav === 'corpus'
              ? 'bg-surface-container-lowest text-primary shadow-2xs font-semibold'
              : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
          }`}
        >
          Corpus &amp; Provenance
        </button>
        <button
          onClick={() => onNavChange?.('audit')}
          className={`px-3 py-1 rounded transition-colors font-medium ${
            activeNav === 'audit'
              ? 'bg-surface-container-lowest text-primary shadow-2xs font-semibold'
              : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
          }`}
        >
          Audit Log
        </button>
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs">
        {/* API Key Status Pill */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-[11px] ${
          hasApiKey
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-600' : 'bg-amber-500 animate-ping'}`}></span>
          <span className="hidden sm:inline">{hasApiKey ? 'API: Ready' : 'API: Key Missing'}</span>
          <span className="sm:hidden">{hasApiKey ? 'Ready' : 'No Key'}</span>
        </div>

        <button
          onClick={() => window.print()}
          className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-surface-container-high hover:bg-surface-container-low text-primary font-medium transition-colors"
          type="button"
          title="Print or export PDF"
        >
          <span className="material-symbols-outlined text-[15px]">print</span>
          <span>Print</span>
        </button>

        <a
          href="https://ai.google.dev/gemini-api/docs/google-search"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-surface-container-high hover:bg-surface-container-low text-primary font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-[15px]">menu_book</span>
          <span className="hidden sm:inline">Docs</span>
        </a>
      </div>
    </header>
  );
}
