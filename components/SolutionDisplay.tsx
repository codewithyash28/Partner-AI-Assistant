
import React from 'react';
import { SolutionRecommendation } from '../types';

interface SolutionDisplayProps {
  solution: SolutionRecommendation;
}

const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ solution }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Problem Summary */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
          <i className="fa-solid fa-lightbulb text-yellow-500 mr-3"></i>
          Problem Summary
        </h3>
        <p className="text-gray-700 leading-relaxed">{solution.problemSummary}</p>
      </section>

      {/* Recommended Services */}
      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <i className="fa-solid fa-layer-group text-blue-600 mr-3"></i>
          Recommended GCP Services
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {solution.recommendedServices.map((service, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full mb-2">
                Service
              </span>
              <h4 className="font-bold text-gray-900 mb-1">{service.name}</h4>
              <p className="text-sm text-gray-600">{service.reason}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="bg-gray-900 text-white p-8 rounded-2xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <i className="fa-solid fa-microchip text-8xl"></i>
        </div>
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <i className="fa-solid fa-sitemap text-blue-400 mr-3"></i>
          Architectural Overview
        </h3>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{solution.architectureOverview}</p>
        </div>
      </section>

      {/* Best Practices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <i className="fa-solid fa-shield-halved text-green-600 mr-3"></i>
            Best Practices
          </h3>
          <ul className="space-y-3">
            {solution.bestPractices.map((bp, idx) => (
              <li key={idx} className="flex items-start text-gray-700 text-sm">
                <i className="fa-solid fa-circle-check text-green-500 mt-1 mr-3 flex-shrink-0"></i>
                <span>{bp}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-orange-50 p-6 rounded-xl shadow-sm border border-orange-100">
          <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center">
            <i className="fa-solid fa-triangle-exclamation text-orange-600 mr-3"></i>
            Architect Notes
          </h3>
          <p className="text-orange-800 text-sm leading-relaxed italic">
            "{solution.notes}"
          </p>
        </section>
      </div>
    </div>
  );
};

export default SolutionDisplay;
