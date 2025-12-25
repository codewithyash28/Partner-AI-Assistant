
import React, { useState, useEffect } from 'react';
import { AppStatus, SolutionRecommendation, ViewMode, HistoryItem, Incident } from './types';
import { generateCloudSolution } from './services/geminiService';
import { TelemetrySystem } from './services/telemetry';
import LoadingSpinner from './components/LoadingSpinner';
import SolutionDisplay from './components/SolutionDisplay';
import Dashboard from './components/Dashboard';
import ObservabilityDashboard from './components/ObservabilityDashboard';
import LoginPage from './components/LoginPage';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('ARCHITECT');
  const [problem, setProblem] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [solution, setSolution] = useState<SolutionRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isSafeMode, setIsSafeMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('partner_ai_history_v3');
    const authStatus = localStorage.getItem('partner_ai_auth');
    
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
    if (authStatus) {
      setIsLoggedIn(true);
      setUserEmail(authStatus);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('partner_ai_history_v3', JSON.stringify(history));
  }, [history]);

  const handleLogin = (email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    localStorage.setItem('partner_ai_auth', email);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('partner_ai_auth');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) return;

    setStatus(AppStatus.LOADING);
    setError(null);
    
    try {
      const { solution: result, telemetry } = await generateCloudSolution(problem, userEmail);
      
      // Auto-Incident detection logic
      if (telemetry.latencyMs > 2500) {
        triggerIncident('LATENCY', `High latency detected: ${telemetry.latencyMs}ms in request ${telemetry.requestId.split('-')[0]}`);
      }
      if (telemetry.isPiiDetected) {
        triggerIncident('SAFETY', `PII Data was automatically redacted in session ${telemetry.requestId.substring(0, 8)}`);
      }
      if (telemetry.hallucinationScore > 0.1) {
        triggerIncident('HALLUCINATION', `Heuristic anomaly: Possible factual drift detected in model output.`);
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
      triggerIncident('ERROR_RATE', `Backend exception: ${err.message}`);
    }
  };

  const triggerIncident = (type: Incident['type'], message: string) => {
    const newInc = TelemetrySystem.generateIncident(type, message);
    setIncidents(prev => [newInc, ...prev]);
    
    // Auto-Remediation logic (Safe Mode / Circuit Breaker)
    if (incidents.length > 3) {
      setIsSafeMode(true);
      setTimeout(() => setIsSafeMode(false), 30000); // 30s lockdown
    }
  };

  const handleSimulate = (type: 'LATENCY' | 'ERROR' | 'SURGE') => {
    if (type === 'LATENCY') triggerIncident('LATENCY', 'Manual Stress Test: Injected 5000ms latency spike.');
    if (type === 'ERROR') triggerIncident('ERROR_RATE', 'Synthetic 500 Error burst triggered by operator.');
    if (type === 'SURGE') triggerIncident('BURN_RATE', 'Cost threshold exceeded: Unexpected token surge in region US-CENTRAL1.');
    setViewMode('OBSERVABILITY');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center mb-8 px-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <i className="fa-solid fa-cloud-bolt"></i>
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">Partner AI Assistant</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{userEmail}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="text-xs font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center"
        >
          Sign Out
          <i className="fa-solid fa-right-from-bracket ml-2"></i>
        </button>
      </div>

      {/* Safe Mode Alert (Circuit Breaker) */}
      {isSafeMode && (
        <div className="bg-red-600 text-white text-center py-3 px-6 rounded-2xl mb-8 text-xs font-black animate-pulse shadow-2xl flex items-center justify-center space-x-4 border-2 border-red-400">
          <i className="fa-solid fa-triangle-exclamation text-lg"></i>
          <span className="uppercase tracking-[0.1em]">CIRCUIT BREAKER ENGAGED: AUTO-ROLLBACK ACTIVE (30s Lockdown)</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex justify-center mb-12">
        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center shadow-inner border border-slate-200 overflow-hidden">
          {[
            { id: 'ARCHITECT', icon: 'fa-compass-drafting', label: 'Architect' },
            { id: 'DASHBOARD', icon: 'fa-chart-pie', label: 'Portfolio' },
            { id: 'OBSERVABILITY', icon: 'fa-microchip', label: 'Ops Hub' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setViewMode(tab.id as ViewMode)}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center whitespace-nowrap ${viewMode === tab.id ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
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
            <section className={`bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-500 ${status === AppStatus.SUCCESS ? 'max-h-0 opacity-0 mb-0 scale-95' : 'max-h-[1000px] opacity-100 scale-100'}`}>
              <div className="bg-blue-600 px-8 py-4 flex justify-between items-center">
                <h2 className="text-white font-bold flex items-center text-sm uppercase tracking-tight">
                  <i className="fa-solid fa-comment-dots mr-3"></i>
                  Design New Architecture
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-8">
                <textarea
                  className="w-full h-40 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none text-slate-800"
                  placeholder="Describe your client's business challenge..."
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  disabled={status === AppStatus.LOADING || isSafeMode}
                />
                <div className="mt-6 flex justify-between items-center">
                  <div className="flex flex-col">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center">
                      <i className="fa-solid fa-shield-check text-green-500 mr-2"></i>
                      Data Privacy (PII) Redaction Active
                    </p>
                    <p className="text-[9px] text-slate-400 mt-1 uppercase">Model: Gemini 3 Flash Preview</p>
                  </div>
                  <button
                    type="submit"
                    disabled={status === AppStatus.LOADING || !problem.trim() || isSafeMode}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black py-4 px-10 rounded-2xl shadow-lg transition-all flex items-center uppercase tracking-widest text-xs"
                  >
                    {status === AppStatus.LOADING ? (
                      <i className="fa-solid fa-circle-notch fa-spin mr-3"></i>
                    ) : (
                      <i className="fa-solid fa-bolt mr-3"></i>
                    )}
                    Generate Blueprint
                  </button>
                </div>
              </form>
            </section>

            {status === AppStatus.LOADING && <LoadingSpinner />}
            {status === AppStatus.SUCCESS && solution && (
              <div className="animate-in slide-in-from-top-12 duration-1000">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-slate-900 uppercase flex items-center">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center mr-3 text-[10px]">AI</span>
                    Blueprint
                  </h2>
                  <button onClick={() => setStatus(AppStatus.IDLE)} className="text-xs font-black uppercase tracking-widest text-blue-600 hover:underline">New Analysis</button>
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

      <footer className="mt-24 pt-10 border-t border-slate-200 text-center space-y-2">
        <p className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase italic opacity-50">PRODUCTION TELEMETRY / SOC-2 COMPLIANT WORKSPACE</p>
      </footer>
    </div>
  );
};

export default App;
