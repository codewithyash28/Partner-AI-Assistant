
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
  const piiCount = history.filter(h => h.telemetry.isPiiDetected).length;

  const exportDatadogJson = () => {
    const dashboardExport = {
      title: "Partner AI Observability Dashboard",
      widgets: [
        { definition: { type: "timeseries", title: "Latency (ms)", requests: [{ q: "avg:partner.ai.latency{*}" }] } },
        { definition: { type: "query_value", title: "Error Rate", requests: [{ q: "sum:partner.ai.errors{*}/sum:partner.ai.requests{*}" }] } },
        { definition: { type: "toplist", title: "Safety Hits", requests: [{ q: "top(sum:partner.ai.safety_hits{*} by {type}, 10, 'sum', 'desc')" }] } }
      ],
      template_variables: [],
      layout_type: "ordered",
      description: "Auto-generated export for Google Cloud Partner AI Hackathon"
    };

    const blob = new Blob([JSON.stringify(dashboardExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'datadog-partner-ai-dashboard.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Simulation Controls */}
      <div className="bg-gray-900 text-white p-4 rounded-xl flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Control Center</span>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={exportDatadogJson} 
            className="text-[10px] bg-gray-800 hover:bg-gray-700 border border-gray-600 px-3 py-1 rounded-lg transition-all flex items-center"
          >
            <i className="fa-solid fa-file-export mr-2"></i>
            Datadog Export (JSON)
          </button>
          <button onClick={() => onTriggerSim('LATENCY')} className="text-[10px] bg-red-900/50 hover:bg-red-800 border border-red-700 px-3 py-1 rounded-lg transition-all">Simulate Spike</button>
          <button onClick={() => onTriggerSim('SURGE')} className="text-[10px] bg-blue-900/50 hover:bg-blue-800 border border-blue-700 px-3 py-1 rounded-lg transition-all">Traffic Surge</button>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Latency', val: `${avgLatency}ms`, sub: 'P95: 1.2s', icon: 'fa-gauge-high', color: 'text-blue-600' },
          { label: 'Token Burn', val: totalTokens.toLocaleString(), sub: 'Est Cost: $0.12', icon: 'fa-coins', color: 'text-yellow-600' },
          { label: 'Safety Filtering', val: '99.9%', sub: `${piiCount} PII Blocks`, icon: 'fa-shield-halved', color: 'text-green-600' },
          { label: 'Hallucination Rate', val: '0.42%', sub: 'Healthy', icon: 'fa-brain', color: 'text-purple-600' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{kpi.label}</span>
              <i className={`fa-solid ${kpi.icon} ${kpi.color}`}></i>
            </div>
            <p className="text-2xl font-black text-gray-900">{kpi.val}</p>
            <p className="text-[10px] text-gray-500 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Log */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-tight">Active Incidents</h3>
            <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{incidents.length}</span>
          </div>
          <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
            {incidents.length === 0 && <p className="text-center py-10 text-gray-400 text-sm italic">System stable. No incidents.</p>}
            {incidents.map((inc) => (
              <div key={inc.id} className="p-4 border border-red-100 bg-red-50/30 rounded-xl">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${inc.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                    <span className="text-xs font-black text-gray-900">{inc.id}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">{new Date(inc.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-sm font-medium text-gray-800 mt-2">{inc.message}</p>
                <div className="mt-3 flex space-x-2">
                  <button className="text-[10px] font-bold bg-white border border-gray-200 px-3 py-1 rounded shadow-sm hover:bg-gray-50">View Trace</button>
                  <a href={inc.playbookLink} target="_blank" className="text-[10px] font-bold bg-blue-600 text-white px-3 py-1 rounded shadow-sm hover:bg-blue-700 flex items-center">
                    Run Playbook <i className="fa-solid fa-arrow-right-long ml-2"></i>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Telemetry Stream */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="font-bold text-gray-400 text-sm uppercase tracking-tight">Real-time Traces</h3>
            <span className="text-[10px] font-mono text-gray-500">WS Connected</span>
          </div>
          <div className="p-4 space-y-2 font-mono text-[10px] max-h-[400px] overflow-y-auto">
            {history.map((h) => (
              <div key={h.id} className="text-gray-400 border-l-2 border-blue-500 pl-3 py-1 bg-white/5 rounded-r">
                <p className="text-blue-400">POST /v1/architect <span className="text-green-400">200 OK</span></p>
                <p>trace_id: {h.telemetry.requestId.split('-')[0]}...</p>
                <p>latency: {h.telemetry.latencyMs}ms | tokens: {Math.round(h.telemetry.tokensIn + h.telemetry.tokensOut)}</p>
                <p>pii_scrubbed: {h.telemetry.isPiiDetected ? 'TRUE' : 'FALSE'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObservabilityDashboard;
