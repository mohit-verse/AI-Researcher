import React from 'react';

export default function SourceList({ sources, searchQueries, hasGrounding, limitationNotice }) {
  if (!sources || sources.length === 0) {
    return (
      <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container-high shadow-2xs text-center text-xs text-outline">
        {limitationNotice ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-left">
            <span className="font-semibold block mb-1">Notice</span>
            <span>{limitationNotice}</span>
          </div>
        ) : (
          <p>No verified web corpus pinned yet.</p>
        )}
      </div>
    );
  }

  return (
    <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container-high shadow-2xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-surface-container-high/60">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-secondary">inventory_2</span>
          <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-primary">
            Corpus Index ({sources.length} Pinned)
          </h3>
        </div>
        <span className="font-mono text-[10px] text-secondary font-semibold uppercase">
          Verified Grounded
        </span>
      </div>

      {/* Cards List */}
      <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-1">
        {sources.map((src) => (
          <a
            key={src.id}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-all group border border-transparent hover:border-surface-container-high"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="px-1.5 py-0.5 rounded bg-surface-container-highest font-mono text-[11px] text-primary font-bold">
                [{src.index}]
              </span>
              <span className="font-mono text-[10px] text-secondary bg-secondary-container/70 px-1.5 py-0.5 rounded font-medium">
                Verified Match
              </span>
            </div>

            <h4 className="font-sans text-xs font-semibold text-primary group-hover:text-secondary line-clamp-2 leading-snug">
              {src.title}
            </h4>

            <div className="mt-2 flex items-center justify-between text-outline font-mono text-[10px]">
              <span className="truncate max-w-[200px] text-secondary font-medium">
                {src.domain}
              </span>
              <span className="material-symbols-outlined text-[14px] group-hover:text-primary transition-colors">
                open_in_new
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* Underlying Search Queries */}
      {searchQueries && searchQueries.length > 0 && (
        <div className="pt-3 border-t border-surface-container-high/60">
          <span className="font-mono text-[10px] uppercase tracking-wider text-outline block mb-1.5">
            Dispatched Queries:
          </span>
          <div className="flex flex-wrap gap-1">
            {searchQueries.map((q, idx) => (
              <span
                key={idx}
                className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container border border-surface-container-high text-on-surface"
              >
                "{q}"
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
