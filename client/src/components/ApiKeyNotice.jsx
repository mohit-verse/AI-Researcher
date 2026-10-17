import React, { useState } from 'react';

export default function ApiKeyNotice({ hasApiKey, onRefresh }) {
  const [copied, setCopied] = useState(false);

  if (hasApiKey) return null;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText('GEMINI_API_KEY=your_key_here\nPORT=3001').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <h3 className="text-sm font-semibold text-amber-900 font-serif">
              Gemini API Key Required in <code className="font-mono text-xs bg-amber-100 px-1 py-0.5 rounded">server/.env</code>
            </h3>
            <span className="text-[11px] font-mono text-amber-700">Setup Step 1 of 1</span>
          </div>

          <p className="text-xs text-amber-800 leading-relaxed">
            Scout AI uses the official Google GenAI SDK with Google Search grounding. To enable live research, please add your Gemini API key to the backend environment file.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-amber-900 font-semibold underline hover:text-amber-700"
            >
              <span>Get API key from Google AI Studio</span>
              <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <span className="text-amber-400">·</span>

            <button
              onClick={handleCopyEnv}
              className="inline-flex items-center text-amber-800 hover:text-amber-950 font-mono text-[11px]"
            >
              <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>{copied ? 'Copied .env syntax!' : 'Copy .env snippet'}</span>
            </button>

            <span className="text-amber-400">·</span>

            <button
              onClick={onRefresh}
              className="text-amber-800 hover:text-amber-950 underline font-medium"
            >
              Re-check Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
