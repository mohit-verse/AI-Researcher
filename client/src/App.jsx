import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header.jsx';
import TopicInput from './components/TopicInput.jsx';
import ActivityTimeline from './components/ActivityTimeline.jsx';
import ReportView from './components/ReportView.jsx';
import SourceList from './components/SourceList.jsx';
import ApiKeyNotice from './components/ApiKeyNotice.jsx';

export default function App() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [model, setModel] = useState('gemini-3.8-flash');
  const [currentTopic, setCurrentTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [plan, setPlan] = useState(null);
  const [report, setReport] = useState(null);
  const [sources, setSources] = useState([]);
  const [searchQueries, setSearchQueries] = useState([]);
  const [error, setError] = useState(null);
  const [activeMobileTab, setActiveMobileTab] = useState('report'); // 'report' | 'timeline' | 'sources'

  const eventSourceRef = useRef(null);

  // Check health and backend API key configuration on load
  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHasApiKey(Boolean(data.hasApiKey));
        if (data.model) setModel(data.model);
      }
    } catch (e) {
      console.warn('Backend connection error:', e);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  // Cleanup event source on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleStartResearch = (topic) => {
    // Reset previous run states
    setCurrentTopic(topic);
    setIsLoading(true);
    setError(null);
    setEvents([]);
    setPlan(null);
    setReport(null);
    setSources([]);
    setSearchQueries([]);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Open SSE connection
    const sseUrl = `/api/research/stream?topic=${encodeURIComponent(topic)}`;
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    const handleEvent = (eventData) => {
      setEvents((prev) => [...prev, eventData]);

      if (eventData.event === 'plan_created' && eventData.plan) {
        setPlan(eventData.plan);
      }

      if (eventData.event === 'evidence_retrieved') {
        if (eventData.searchQueriesExecuted) {
          setSearchQueries(eventData.searchQueriesExecuted);
        }
      }

      if (eventData.event === 'completed') {
        if (eventData.report) setReport(eventData.report);
        if (eventData.sources) setSources(eventData.sources);
        if (eventData.searchQueries) setSearchQueries(eventData.searchQueries);
        if (eventData.plan) setPlan(eventData.plan);
        setIsLoading(false);
        es.close();
      }

      if (eventData.event === 'failed') {
        setError(eventData.message || 'Research run encountered a critical error.');
        setIsLoading(false);
        es.close();
      }
    };

    // Generic message handler
    es.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);
        if (parsed.event) handleEvent(parsed);
      } catch (err) {
        console.warn('SSE parse error:', err);
      }
    };

    // Stage listeners
    const stages = [
      'request_received',
      'plan_started',
      'plan_created',
      'research_running',
      'evidence_retrieved',
      'synthesis_started',
      'synthesis_completed',
      'completed',
      'failed',
    ];

    stages.forEach((stageName) => {
      es.addEventListener(stageName, (e) => {
        try {
          const parsed = JSON.parse(e.data);
          handleEvent(parsed);
        } catch (err) {
          console.warn(`Error handling ${stageName}:`, err);
        }
      });
    });

    es.addEventListener('done', () => {
      setIsLoading(false);
      es.close();
    });

    es.onerror = (e) => {
      console.warn('SSE connection error:', e);
      // If we already finished, ignore close error
      if (!report && !error) {
        setError('Lost real-time connection to research server. Verify server/.env configuration and network.');
      }
      setIsLoading(false);
      es.close();
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface font-sans">
      <Header hasApiKey={hasApiKey} model={model} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 space-y-6">
        {/* API Key Notice */}
        <ApiKeyNotice hasApiKey={hasApiKey} onRefresh={checkHealth} />

        {/* Input Area */}
        <TopicInput
          onSubmit={handleStartResearch}
          isLoading={isLoading}
          currentTopic={currentTopic}
        />

        {/* Mobile Tab Selector */}
        <div className="flex lg:hidden border-b border-surface-container-high bg-surface-container-low rounded-lg p-1">
          <button
            onClick={() => setActiveMobileTab('report')}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
              activeMobileTab === 'report'
                ? 'bg-surface-container-lowest text-primary shadow-2xs font-semibold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Briefing View
          </button>
          <button
            onClick={() => setActiveMobileTab('timeline')}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
              activeMobileTab === 'timeline'
                ? 'bg-surface-container-lowest text-primary shadow-2xs font-semibold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Trajectory ({events.length})
          </button>
          <button
            onClick={() => setActiveMobileTab('sources')}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
              activeMobileTab === 'sources'
                ? 'bg-surface-container-lowest text-primary shadow-2xs font-semibold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Corpus ({sources.length})
          </button>
        </div>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Timeline & Sources (Desktop) */}
          <div className={`lg:col-span-4 space-y-6 ${activeMobileTab !== 'report' ? 'block' : 'hidden lg:block'}`}>
            <div className={activeMobileTab === 'timeline' || activeMobileTab === 'report' ? 'block' : 'hidden lg:block'}>
              <ActivityTimeline
                events={events}
                isRunning={isLoading}
                plan={plan}
                searchQueries={searchQueries}
                error={error}
              />
            </div>

            <div className={activeMobileTab === 'sources' || activeMobileTab === 'report' ? 'block' : 'hidden lg:block'}>
              <SourceList
                sources={sources}
                searchQueries={searchQueries}
                hasGrounding={report?.hasGrounding || sources.length > 0}
                limitationNotice={report?.groundingLimitationNotice}
              />
            </div>
          </div>

          {/* Right Column: Structured Research Report */}
          <div className={`lg:col-span-8 ${activeMobileTab === 'report' ? 'block' : 'hidden lg:block'}`}>
            <ReportView
              report={report}
              isLoading={isLoading}
              plan={plan}
              events={events}
              sources={sources}
              searchQueries={searchQueries}
            />
          </div>
        </div>
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-surface-container-high bg-surface-container-lowest py-6 mt-12 text-center text-xs text-on-surface-variant">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-bold text-charcoal-900">Scout AI</span>
            <span>—</span>
            <span>Official Google GenAI SDK Grounded Research Agent</span>
          </div>
          <div className="font-mono text-[11px]">
            Zero fabricated sources · Google Search Grounded
          </div>
        </div>
      </footer>
    </div>
  );
}
