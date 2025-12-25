
import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (email: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSSOLoading, setIsSSOLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay for manual authentication
    setTimeout(() => {
      onLogin(email);
      setIsLoading(false);
    }, 1500);
  };

  const handleGoogleSSO = () => {
    setIsSSOLoading(true);
    // Simulate a Google OAuth 2.0 redirect and callback
    setTimeout(() => {
      onLogin('google-sso-partner@gcp-experts.com');
      setIsSSOLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="z-10 w-full max-w-md p-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/20">
              <i className="fa-solid fa-cloud-bolt text-3xl text-white"></i>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Partner AI Gateway</h1>
            <p className="text-slate-400 text-sm mt-2">Sign in to access GCP Solution Architect tools</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Work Email</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700"
                  placeholder="name@partner-org.com"
                  disabled={isLoading || isSSOLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700"
                  placeholder="••••••••"
                  disabled={isLoading || isSSOLoading}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading || isSSOLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center group"
            >
              {isLoading ? (
                <i className="fa-solid fa-circle-notch fa-spin"></i>
              ) : (
                <>
                  Enter Workspace
                  <i className="fa-solid fa-arrow-right-long ml-3 group-hover:translate-x-1 transition-transform"></i>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5">
            <button 
              onClick={handleGoogleSSO}
              disabled={isLoading || isSSOLoading}
              className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl transition-all hover:bg-slate-100 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSSOLoading ? (
                <i className="fa-solid fa-circle-notch fa-spin text-blue-600"></i>
              ) : (
                <>
                  <img src="https://www.gstatic.com/images/branding/product/1x/gsuite_512dp.png" className="w-5 h-5 mr-3" alt="Google" />
                  Sign in with Google Cloud
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button className="text-[10px] font-black text-slate-500 hover:text-blue-400 uppercase tracking-widest transition-colors">
              Request Partner Access
            </button>
          </div>
        </div>
        
        <p className="text-center text-slate-600 text-[10px] mt-8 font-medium uppercase tracking-[0.2em]">
          Powered by Gemini 3 Flash & Google Cloud
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
