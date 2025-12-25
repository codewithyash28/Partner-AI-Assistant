
import React from 'react';
import { HistoryItem } from '../types';

interface DashboardProps {
  history: HistoryItem[];
  onSelectSolution: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

const getServiceEstimate = (name: string): number => {
  const n = name.toLowerCase();
  if (n.includes('spanner')) return 450;
  if (n.includes('gke') || n.includes('kubernetes')) return 120;
  if (n.includes('bigquery')) return 80;
  if (n.includes('sql')) return 65;
  if (n.includes('run')) return 15;
  if (n.includes('functions')) return 5;
  if (n.includes('storage')) return 12;
  if (n.includes('pub/sub')) return 10;
  if (n.includes('looker')) return 300;
  if (n.includes('vertex')) return 150;
  return 25;
};

const calculateTotalCost = (item: HistoryItem): number => {
  if (!item.solution.recommendedServices) return 0;
  return item.solution.recommendedServices.reduce((acc, s) => acc + getServiceEstimate(s.name), 0);
};

const Dashboard: React.FC<DashboardProps> = ({ history, onSelectSolution, onClearHistory }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
        <div className="bg-slate-100 p-6 rounded-full mb-4">
          <i className="fa-solid fa-folder-open text-4xl text-slate-400"></i>
        </div>
        <h3 className="text-xl font-bold text-slate-900">No architectures found</h3>
        <p className="text-slate-500 mt-2">Start a new project in the Architect tab to see your history here.</p>
      </div>
    );
  }

  const totalPortfolioValue = history.reduce((acc, item) => acc + calculateTotalCost(item), 0);
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-blue-600 px-8 py-6 flex flex-col md:flex-row justify-between items-center text-white">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-black uppercase tracking-tight">Portfolio Summary</h2>
            <p className="text-blue-100 text-sm font-medium">Historical Architecture Repository</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 mb-1">Total Estimated Monthly Cost</p>
            <p className="text-4xl font-black tracking-tighter">${totalPortfolioValue.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="p-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Solutions</p>
            <p className="text-2xl font-bold text-slate-900">{history.length}</p>
          </div>
          <div className="p-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Regions</p>
            <p className="text-2xl font-bold text-slate-900">Multi-Regional</p>
          </div>
          <div className="p-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Generated</p>
            <p className="text-2xl font-bold text-slate-900">{new Date(history[0].timestamp).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-black text-slate-900 flex items-center uppercase tracking-tight">
          <i className="fa-solid fa-clock-rotate-left mr-3 text-blue-600"></i>
          Recent Blueprints
        </h2>
        <button 
          onClick={onClearHistory}
          className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors bg-red-50 px-4 py-2 rounded-full border border-red-100"
        >
          Wipe Workspace History
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item) => {
          const estimatedCost = calculateTotalCost(item);
          return (
            <div 
              key={item.id}
              onClick={() => onSelectSolution(item)}
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer overflow-hidden flex flex-col transform hover:-translate-y-1"
            >
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                  <div className="bg-green-50 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-green-100">
                    EST. ${estimatedCost}/MO
                  </div>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                  {item.solution.problemSummary}
                </h4>
                <div className="flex flex-wrap gap-2 mt-4">
                  {item.solution.recommendedServices.slice(0, 3).map((s, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 group-hover:bg-blue-50 transition-colors">
                <p className="text-xs text-slate-500 line-clamp-1 italic">
                  "{item.problemDescription}"
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
