
import React from 'react';
import { HistoryItem } from '../types';

interface DashboardProps {
  history: HistoryItem[];
  onSelectSolution: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

// Simplified mock cost model for GCP services (Monthly estimates)
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
  return 25; // Default catch-all
};

const calculateTotalCost = (item: HistoryItem): number => {
  return item.solution.recommendedServices.reduce((acc, s) => acc + getServiceEstimate(s.name), 0);
};

const Dashboard: React.FC<DashboardProps> = ({ history, onSelectSolution, onClearHistory }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <i className="fa-solid fa-folder-open text-4xl text-gray-400"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-900">No architectures found</h3>
        <p className="text-gray-500 mt-2">Start a new project in the Architect tab to see your history here.</p>
      </div>
    );
  }

  const totalPortfolioValue = history.reduce((acc, item) => acc + calculateTotalCost(item), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Solutions</p>
          <p className="text-3xl font-black text-blue-600 mt-1">{history.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Est. Monthly Footprint</p>
          <p className="text-3xl font-black text-green-600 mt-1">
            ${totalPortfolioValue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Recent Project</p>
          <p className="text-lg font-bold text-gray-900 mt-2 truncate">
            {history[0].solution.problemSummary}
          </p>
        </div>
      </div>

      {/* History Grid */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Recent Architecture Projects</h2>
        <button 
          onClick={onClearHistory}
          className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item) => {
          const estimatedCost = calculateTotalCost(item);
          return (
            <div 
              key={item.id}
              onClick={() => onSelectSolution(item)}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                  <div className="bg-green-50 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-green-100">
                    EST. ${estimatedCost}/MO
                  </div>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                  {item.solution.problemSummary}
                </h4>
                <div className="flex flex-wrap gap-2 mt-4">
                  {item.solution.recommendedServices.slice(0, 3).map((s, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">
                      {s.name}
                    </span>
                  ))}
                  {item.solution.recommendedServices.length > 3 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold rounded">
                      +{item.solution.recommendedServices.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 group-hover:bg-blue-50 transition-colors">
                <p className="text-xs text-gray-500 line-clamp-1 italic">
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
