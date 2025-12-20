
import React, { useState } from 'react';
import { AppStatus, SolutionRecommendation } from './types';
import { generateCloudSolution } from './services/geminiService';
import LoadingSpinner from './components/LoadingSpinner';
import SolutionDisplay from './components/SolutionDisplay';

const App: React.FC = () => {
  const [problem, setProblem] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [solution, setSolution] = useState<SolutionRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) return;

    setStatus(AppStatus.LOADING);
    setError(null);
    
    try {
      const result = await generateCloudSolution(problem);
      setSolution(result);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate solution. Please try again.');
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setProblem('');
    setSolution(null);
    setStatus(AppStatus.IDLE);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-16">
      {/* Header */}
      <header className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-blue-500 transform hover:scale-105 transition-transform">
             <i className="fa-solid fa-robot text-4xl text-blue-600"></i>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
          Partner <span className="text-blue-600">AI</span> Assistant
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          The ultimate hackathon tool for Google Cloud Partners. 
          Instantly transform complex business requirements into enterprise-grade GCP architectures.
        </p>
      </header>

      {/* Main Content Area */}
      <main className="space-y-12">
        
        {/* Input Form */}
        <section className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-500 ${status === AppStatus.SUCCESS ? 'opacity-50 scale-95 pointer-events-none' : 'opacity-100'}`}>
          <div className="bg-blue-600 px-8 py-4">
            <h2 className="text-white font-bold flex items-center">
              <i className="fa-solid fa-comment-dots mr-3"></i>
              Describe Client Challenge
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-8">
            <textarea
              className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none text-gray-800 placeholder-gray-400"
              placeholder="e.g. A global retailer needs to migrate their on-premise inventory system to GCP. They handle 10,000 transactions per second and require low latency for mobile apps in SE Asia..."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              disabled={status === AppStatus.LOADING}
            />
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={status === AppStatus.LOADING || !problem.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center"
              >
                {status === AppStatus.LOADING ? (
                   <i className="fa-solid fa-spinner fa-spin mr-3"></i>
                ) : (
                  <i className="fa-solid fa-bolt mr-3"></i>
                )}
                Generate Architecture
              </button>
            </div>
          </form>
        </section>

        {/* Loading State */}
        {status === AppStatus.LOADING && <LoadingSpinner />}

        {/* Error State */}
        {status === AppStatus.ERROR && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl animate-in zoom-in-95 duration-200">
            <div className="flex">
              <i className="fa-solid fa-circle-exclamation text-red-500 text-xl mr-4"></i>
              <div>
                <h3 className="text-red-800 font-bold mb-1">Architecting Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
                <button 
                  onClick={() => setStatus(AppStatus.IDLE)}
                  className="mt-4 text-sm font-bold text-red-600 hover:underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Area */}
        {status === AppStatus.SUCCESS && solution && (
          <div className="animate-in slide-in-from-top-8 duration-700">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Architectural Response</h2>
              <button 
                onClick={handleReset}
                className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                <i className="fa-solid fa-rotate-left mr-2"></i>
                New Solution
              </button>
            </div>
            <SolutionDisplay solution={solution} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 pt-8 border-t border-gray-200 text-center text-gray-400 text-xs">
        <p>© 2024 Partner AI Assistant | Powered by Google Gemini 3 Flash</p>
        <p className="mt-2">Hackathon Prototype - Google Cloud Solution Architect Team</p>
      </footer>
    </div>
  );
};

export default App;
