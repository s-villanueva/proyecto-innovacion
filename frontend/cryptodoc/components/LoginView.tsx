import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface LoginViewProps {
  onLogin: (email: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("Registration successful! Please check your email to verify your account.");
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // App.tsx listener will handle the state update
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background-light dark:bg-background-dark p-4 font-display">
      <div className="w-full max-w-md bg-white dark:bg-[#1a2436] rounded-2xl border border-[#e5e7eb] dark:border-[#324467] shadow-xl overflow-hidden animate-fade-in">

        {/* Header / Logo */}
        <div className="p-8 pb-0 text-center">
          <div className="flex justify-center mb-4">
            <div className="size-16 text-secondary bg-secondary/10 rounded-2xl flex items-center justify-center p-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <circle cx="16" cy="13" r="2" className="fill-current text-secondary" stroke="none" />
                <circle cx="16" cy="18" r="1.5" className="fill-current text-secondary" stroke="none" />
                <path d="M16 13V18" strokeWidth="1.5" />
                <path d="M8 13H10" strokeWidth="2" />
                <path d="M8 17H12" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-primary dark:text-white">CryptoDoc <span className="text-secondary text-base">S.R.L.</span></h1>
          <p className="text-[#637588] dark:text-[#92a4c9] text-sm mt-2">
            Secure Blockchain Document Storage
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          <h2 className="text-lg font-bold text-text-main dark:text-white mb-6 text-center">
            {isSignUp ? 'Create an Account' : 'Sign In to Dashboard'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-[#637588] dark:text-[#92a4c9] ml-1">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#92a4c9] text-[20px]">mail</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f9fafb] dark:bg-[#232f48] border border-[#e5e7eb] dark:border-[#324467] text-text-main dark:text-white focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all outline-none"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-[#637588] dark:text-[#92a4c9] ml-1">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#92a4c9] text-[20px]">lock</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f9fafb] dark:bg-[#232f48] border border-[#e5e7eb] dark:border-[#324467] text-text-main dark:text-white focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined">{isSignUp ? 'person_add' : 'login'}</span>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-sm text-[#637588] dark:text-[#92a4c9]">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </p>
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
              className="text-sm font-bold text-secondary hover:text-primary dark:hover:text-white transition-colors"
            >
              {isSignUp ? "Sign In instead" : "Create a new account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};