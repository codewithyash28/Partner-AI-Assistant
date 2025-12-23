
import React, { useState, useEffect } from 'react';
import { AppStatus, SolutionRecommendation, ViewMode, HistoryItem, Incident } from './types';
import { generateCloudSolution } from './services/geminiService';
import { TelemetrySystem } from './services/telemetry';
import LoadingSpinner from './components/LoadingSpinner';
import SolutionDisplay from './components/SolutionDisplay';
import Dashboard from './components/Dashboard';
import ObservabilityDashboard from './components/ObservabilityDashboard';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('ARCHITECT');
  const [problem, setProblem] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [solution, setSolution] = useState<SolutionRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isSafeMode, setIsSafeMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('partner_ai_history_v2');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('partner_ai_history_v2', JSON.stringify(history));
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) return;

    setStatus(AppStatus.LOADING);
    setError(null);
    
    try {
      const { solution: result, telemetry } = await generateCloudSolution(problem);
      
      // Auto-Remediation Check
      if (telemetry.latencyMs > 2000) {
        triggerIncident('LATENCY', `High latency detected for ${telemetry.requestId.split('-')[0]}: ${telemetry.latencyMs}ms`);
      }
      if (telemetry.isPiiDetected) {
        triggerIncident('SAFETY', `PII Redaction occurred in request ${telemetry.requestId.split('-')[0]}`);
      }

      const newHistoryItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        problemDescription: problem,
        solution: result,
        telemetry
      };

      setHistory(prev => [newHistoryItem, ...prev]);
      setSolution(result);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
      setStatus(AppStatus.ERROR);
      triggerIncident('ERROR_RATE', `Critical backend failure: ${err.message}`);
    }
  };

  const triggerIncident = (type: Incident['type'], message: string) => {
    const newInc = TelemetrySystem.generateIncident(type, message);
    setIncidents(prev => [newInc, ...prev]);
    
    // Closed-loop Remediation: Enable "Safe Mode" if multiple errors occur
    if (incidents.length > 2) {
      setIsSafeMode(true);
      setTimeout(() => setIsSafeMode(false), 30000); // Reset after 30s
    }
  };

  const handleSimulate = (type: 'LATENCY' | 'ERROR' | 'SURGE') => {
    if (type === 'LATENCY') triggerIncident('LATENCY', 'Synthetic latency spike injected by user.');
    if (type === 'ERROR') triggerIncident('ERROR_RATE', 'Synthetic error spike injected.');
    if (type === 'SURGE') triggerIncident('DRIFT', 'Model drift detected in response embeddings.');
    setViewMode('OBSERVABILITY');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Safe Mode Alert */}
      {isSafeMode && (
        <div className="bg-orange-600 text-white text-center py-2 px-4 rounded-full mb-6 text-xs font-bold animate-pulse shadow-lg flex items-center justify-center space-x-2">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>CIRCUIT BREAKER: AUTO-REMEDIATION ACTIVE (Safe Mode Engaged)</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex justify-center mb-12">
        <div className="bg-gray-200 p-1.5 rounded-2xl flex items-center shadow-inner overflow-hidden">
          {[
            { id: 'ARCHITECT', icon: 'fa-compass-drafting', label: 'Architect' },
            { id: 'DASHBOARD', icon: 'fa-chart-pie', label: 'History' },
            { id: 'OBSERVABILITY', icon: 'fa-microchip', label: 'Observability' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setViewMode(tab.id as ViewMode)}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center whitespace-nowrap ${viewMode === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <i className={`fa-solid ${tab.icon} mr-2`}></i>
              {tab.label}
              {tab.id === 'OBSERVABILITY' && incidents.length > 0 && (
                <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              )}
            </button>
          ))}
        </div>
      </nav>

      <main className="space-y-12">
        {viewMode === 'ARCHITECT' && (
          <>
            <section className={`bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-500 ${status === AppStatus.SUCCESS ? 'max-h-0 opacity-0 mb-0' : 'max-h-[1000px] opacity-100'}`}>
              <div className="bg-blue-600 px-8 py-4 flex justify-between items-center">
                <h2 className="text-white font-bold flex items-center">
                  <i className="fa-solid fa-comment-dots mr-3"></i>
                  Design Architecture
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-8">
                <textarea
                  className="w-full h-40 p-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none text-gray-800"
                  placeholder="Describe your client's business challenge..."
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  disabled={status === AppStatus.LOADING}
                />
                <div className="mt-6 flex justify-between items-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center">
                    <i className="fa-solid fa-shield-check text-green-500 mr-2"></i>
                    PII Scrubbing Enabled
                  </p>
                  <button
                    type="submit"
                    disabled={status === AppStatus.LOADING || !problem.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-2xl shadow-lg transition-all flex items-center"
                  >
                    {status === AppStatus.LOADING ? <i className="fa-solid fa-spinner fa-spin mr-3"></i> : <i className="fa-solid fa-bolt mr-3"></i>}
                    Generate
                  </button>
                </div>
              </form>
            </section>

            {status === AppStatus.LOADING && <LoadingSpinner />}
            {status === AppStatus.SUCCESS && solution && (
              <div className="animate-in slide-in-from-top-12 duration-1000">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-gray-900 uppercase flex items-center">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center mr-3 text-xs">AI</span>
                    Blueprint
                  </h2>
                  <button onClick={() => setStatus(AppStatus.IDLE)} className="text-sm font-bold text-blue-600 hover:underline">New Project</button>
                </div>
                <SolutionDisplay solution={solution} />
              </div>
            )}
          </>
        )}

        {viewMode === 'DASHBOARD' && (
          <Dashboard 
            history={history} 
            onSelectSolution={(item) => { setSolution(item.solution); setProblem(item.problemDescription); setStatus(AppStatus.SUCCESS); setViewMode('ARCHITECT'); }} 
            onClearHistory={() => setHistory([])}
          />
        )}

        {viewMode === 'OBSERVABILITY' && (
          <ObservabilityDashboard 
            history={history} 
            incidents={incidents} 
            onTriggerSim={handleSimulate}
          />
        )}
      </main>

      <footer className="mt-24 pt-10 border-t border-gray-200 text-center space-y-2">
        <p className="text-gray-500 text-xs font-bold tracking-widest uppercase italic">PRODUCTION MODE / SECURE TELEMETRY ACTIVE</p>
      </footer>
    </div>
  );
};

export default App;
