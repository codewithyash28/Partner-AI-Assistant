
import React from 'react';
import { HistoryItem, Incident } from '../types';

interface ObsDashboardProps {
  history: HistoryItem[];
  incidents: Incident[];
  onTriggerSim: (type: 'LATENCY' | 'ERROR' | 'SURGE') => void;
}

const ObservabilityDashboard: React.FC<ObsDashboardProps> = ({ history, incidents, onTriggerSim }) => {
  const avgLatency = history.length ? Math.round(history.reduce((acc, h) => acc + h.telemetry.latencyMs, 0) / history.length) : 0;
  const totalTokens = history.reduce((acc, h) => acc + h.telemetry.tokensIn + h.telemetry.tokensOut, 0);
  const totalCost = history.reduce((acc, h) => acc + h.telemetry.costUsd, 0);
  const piiCount = history.filter(h => h.telemetry.isPiiDetected).length;

  const exportDatadogJson = () => {
    const dashboardExport = {
      title: "Gemini Solution Architect - Production Dashboard",
      description: "Observability for Google Cloud Partner Hackathon",
      widgets: [
        {
          definition: {
            type: "timeseries",
            title: "P95 Model Latency (ms)",
            requests: [{ q: "p95:partner.ai.latency{*}", display_type: "area", style: { palette: "cool" } }]
          }
        },
        {
          definition: {
            type: "query_value",
            title: "Safety Filter Hits",
            requests: [{ q: "sum:partner.ai.safety_hits{*}", aggregator: "sum" }]
          }
        },
        {
          definition: {
            type: "toplist",
            title: "Token Consumption by User",
            requests: [{ q: "top(sum:partner.ai.tokens{*} by {user_hash}, 10, 'sum', 'desc')" }]
          }
        },
        {
          definition: {
            type: "manage_status",
            title: "SLO Status"
          }
        }
      ],
      template_variables: [
        { name: "environment", prefix: "env", default: "production" }
      ],
      layout_type: "ordered"
    };

    const blob = new Blob([JSON.stringify(dashboardExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'partner-ai-datadog-dashboard.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Simulation Controls & Global Status */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="flex -space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 z-10"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-ping opacity-75"></div>
          </div>
          <div>
            <h3 className="text-white font-black text-xs uppercase tracking-[0.2em]">Observability Hub</h3>
            <p className="text-slate-500 text-[10px] font-bold">PROD-REGION-US-CENTRAL1</p>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
          <button 
            onClick={exportDatadogJson} 
            className="group bg-blue-600/10 hover:bg-blue-600 border border-blue-500/30 px-4 py-2 rounded-xl transition-all flex items-center"
          >
            <i className="fa-solid fa-file-export mr-2 text-blue-400 group-hover:text-white"></i>
            <span className="text-[10px] font-black text-blue-400 group-hover:text-white uppercase tracking-widest">Datadog JSON</span>
          </button>
          
          <div className="h-10 w-[1px] bg-slate-800 mx-2 hidden md:block"></div>

          <button onClick={() => onTriggerSim('LATENCY')} className="text-[10px] font-black uppercase tracking-widest bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900 px-4 py-2 rounded-xl transition-all">
            Sim Latency
          </button>
          <button onClick={() => onTriggerSim('SURGE')} className="text-[10px] font-black uppercase tracking-widest bg-indigo-950/40 text-indigo-400 border border-indigo-900/50 hover:bg-indigo-900 px-4 py-2 rounded-xl transition-all">
            Sim Surge
          </button>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg Latency', val: `${avgLatency}ms`, sub: 'Target: <1.5s', icon: 'fa-bolt', color: 'text-blue-500', bg: 'bg-blue-50/50' },
          { label: 'Total Tokens', val: totalTokens.toLocaleString(), sub: `Est. Cost: $${totalCost.toFixed(4)}`, icon: 'fa-coins', color: 'text-yellow-600', bg: 'bg-yellow-50/50' },
          { label: 'Safety Rate', val: '99.98%', sub: `${piiCount} PII Redactions`, icon: 'fa-shield-halved', color: 'text-green-600', bg: 'bg-green-50/50' },
          { label: 'Hallucination', val: '0.2%', sub: 'Healthy Range', icon: 'fa-brain-circuit', color: 'text-purple-600', bg: 'bg-purple-50/50' },
        ].map((kpi, i) => (
          <div key={i} className={`p-6 rounded-2xl border border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow`}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.bg}`}>
                <i className={`fa-solid ${kpi.icon} ${kpi.color}`}></i>
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{kpi.val}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-wide">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Command Center */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col">
          <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest">Active Incidents</h3>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${incidents.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
              <span className="text-[10px] font-black text-slate-500 uppercase">{incidents.length} Detected</span>
            </div>
          </div>
          <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
            {incidents.length === 0 && (
              <div className="py-20 text-center space-y-3">
                <i className="fa-solid fa-circle-check text-4xl text-green-100"></i>
                <p className="text-slate-400 text-sm font-medium italic">No active production issues.</p>
              </div>
            )}
            {incidents.map((inc) => (
              <div key={inc.id} className="p-5 border border-red-100 bg-red-50/30 rounded-2xl group hover:border-red-300 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${inc.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white'}`}>
                      {inc.severity}
                    </span>
                    <span className="text-xs font-black text-slate-900">{inc.id}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">{new Date(inc.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-sm font-bold text-slate-800 mt-3 leading-tight">{inc.message}</p>
                <div className="mt-5 flex gap-2">
                  <a 
                    href={inc.playbookLink} 
                    target="_blank" 
                    className="flex-1 text-center text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white py-2 rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    View Playbook
                  </a>
                  <button className="flex-1 text-center text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-600 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                    Silence
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Telemetry Log (Matrix style) */}
        <div className="bg-slate-950 rounded-3xl border border-slate-900 shadow-2xl overflow-hidden flex flex-col h-[600px]">
          <div className="px-8 py-5 border-b border-slate-900 bg-slate-900/50 flex justify-between items-center">
            <h3 className="font-black text-slate-500 text-xs uppercase tracking-widest">Live Trace Stream</h3>
            <span className="text-[10px] font-mono text-green-500 animate-pulse">STREAMING_ON</span>
          </div>
          <div className="p-6 font-mono text-[10px] overflow-y-auto space-y-4 custom-scrollbar">
            {history.length === 0 && <p className="text-slate-700 italic">Listening for requests...</p>}
            {history.map((h) => (
              <div key={h.id} className="text-slate-400 border-l-2 border-blue-600 pl-4 py-2 bg-white/5 rounded-r-xl group hover:bg-white/10 transition-colors">
                <div className="flex justify-between mb-1">
                  <span className="text-blue-400 font-bold">POST /api/v1/architect</span>
                  <span className="text-green-500">200 OK</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 opacity-75">
                  <p>id: {h.telemetry.requestId.split('-')[0]}...</p>
                  <p>user: {h.telemetry.userHash}</p>
                  <p>latency: <span className={h.telemetry.latencyMs > 2000 ? 'text-red-400' : 'text-slate-300'}>{h.telemetry.latencyMs}ms</span></p>
                  <p>cost: ${h.telemetry.costUsd.toFixed(5)}</p>
                  <p>tokens: {h.telemetry.tokensIn} in / {h.telemetry.tokensOut} out</p>
                  <p>pii: {h.telemetry.isPiiDetected ? 'DETECTED' : 'NONE'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObservabilityDashboard;
