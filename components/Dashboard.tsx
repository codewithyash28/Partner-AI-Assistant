
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
  if (!item.solution.recommendedServices) return 0;
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
  
  // Data for the chart (taking last 10 entries for clarity)
  const chartData = [...history].reverse().slice(-10).map(item => ({
    label: item.solution.problemSummary,
    cost: calculateTotalCost(item),
    id: item.id
  }));

  const maxCost = Math.max(...chartData.map(d => d.cost), 100);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Dashboard Top Header & Stats */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
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
        
        <div className="grid grid-cols-1 md:grid-