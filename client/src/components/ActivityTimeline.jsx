import React from 'react';

const STAGE_ORDER = [
  { id: 'request_received', label: '1. Sanitization & Scoping', desc: 'Query parsed, bounded, and verified.' },
  { id: 'plan_created', label: '2. Hypothesis Decomposition', desc: 'Dispatched targeted investigative interrogatives.' },
  { id: 'research_running', label: '3. Web Grounding Tool', desc: 'Invoked Gemini with Google Search retriever.' },
  { id: 'evidence_retrieved', label: '4. Grounding & Cross-Audit', desc: 'Filtered scrapes to high-signal authentic sources.' },
  { id: 'synthesis_completed', label: '5. Editorial Synthesis', desc: 'Grounded briefing structured with citations.' },
  { id: 'completed', label: '6. Investigation Finalized', desc: 'Peer-grade report rendered with verified links.' },
];

export default function ActivityTimeline({ events, isRunning, plan, searchQueries, error }) {
  const eventMap = {};
  events.forEach((ev) => {
    eventMap[ev.event] = ev;
  });

  const latestEvent = events[events.length - 1];
  const totalRuntimeSec = latestEvent?.elapsedMs ? (latestEvent.elapsedMs / 1000).toFixed(1) : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Reasoning Trajectory Panel */}
      <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container-high shadow-2xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-surface-container-high/60">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-secondary">conversion_path</span>
            <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-primary">
              Reasoning Trajectory
            </h3>
          </div>
          {totalRuntimeSec && (
            <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-mono text-[10px] font-semibold">
              {totalRuntimeSec}s runtime
            </span>
          )}
        </div>

        {events.length === 0 ? (
          <div className="py-6 text-center text-xs text-outline font-sans">
            <p>Awaiting inquiry initiation.</p>
            <p className="mt-1 text-[11px]">Execution stages and live telemetry will trace here.</p>
          </div>
        ) : (
          <div className="relative flex flex-col gap-4 pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container-highest">
            {STAGE_ORDER.map((stage) => {
              const ev = eventMap[stage.id];
              const isCompleted = Boolean(ev);
              const isCurrent = isRunning && !isCompleted;

              return (
                <div key={stage.id} className="relative flex flex-col text-xs">
                  {/* Status node */}
                  <span
                    className={`absolute -left-6 top-1 w-3 h-3 rounded-full ring-4 ring-surface-container-lowest transition-all ${
                      isCompleted
                        ? 'bg-secondary'
                        : isCurrent
                        ? 'bg-amber-500 animate-ping'
                        : 'bg-surface-container-highest'
                    }`}
                  ></span>

                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${isCompleted ? 'text-primary' : 'text-outline'}`}>
                      {stage.label}
                    </span>
                    {ev?.elapsedMs !== undefined && (
                      <span className="font-mono text-[10px] text-outline">
                        {(ev.elapsedMs / 1000).toFixed(2)}s
                      </span>
                    )}
                  </div>

                  <p className="font-sans text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                    {ev?.message || stage.desc}
                  </p>
                </div>
              );
            })}

            {/* Error display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                <span className="font-semibold block mb-0.5">Execution Failed</span>
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sub-Hypotheses Formulated (Research Plan) */}
      {plan?.targetQuestions && plan.targetQuestions.length > 0 && (
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container-high shadow-2xs flex flex-col gap-3">
          <div className="flex items-center gap-1.5 pb-2 border-b border-surface-container-high/60">
            <span className="material-symbols-outlined text-[17px] text-on-surface-variant">schema</span>
            <h4 className="font-mono text-xs uppercase tracking-wider font-bold text-primary">
              Sub-Hypotheses Formulated
            </h4>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            {plan.targetQuestions.map((q, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-surface-container-low flex items-start gap-2">
                <span className="font-mono text-[11px] font-bold text-secondary flex-shrink-0 mt-0.5">
                  H{idx + 1}
                </span>
                <span className="text-on-surface-variant leading-relaxed">{q}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
