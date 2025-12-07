
import React, { useState } from 'react';
import { Lock, X, ChevronRight, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const LandlordAuth: React.FC<Props> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock authentication
    if (pin === '2024') {
      onLoginSuccess();
      setError(false);
      setPin('');
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 ring-1 ring-slate-900/5">
        
        {/* Header */}
        <div className="bg-slate-800 p-6 text-white flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center text-blue-400 ring-1 ring-white/10">
               <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Landlord Access</h2>
              <p className="text-slate-400 text-xs mt-1 font-medium">Restricted Area</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-white/5 p-1.5 rounded-lg hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Security PIN</label>
            <div className="relative group">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-500'}`} size={18} />
              <input 
                type="password" 
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-xl font-mono font-bold tracking-[0.5em] outline-none focus:ring-4 transition-all text-center ${
                  error 
                    ? 'border-red-300 focus:ring-red-100 bg-red-50 text-red-600' 
                    : 'border-slate-200 focus:ring-blue-50 text-slate-800'
                }`}
                placeholder="••••"
                autoFocus
              />
            </div>
            {error ? (
              <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1 animate-pulse">
                <span>Incorrect PIN</span>
              </p>
            ) : (
              <p className="text-slate-400 text-xs mt-2 text-center">Enter the 4-digit access code</p>
            )}
          </div>

          <button 
            type="submit" 
            className="w-full bg-slate-800 text-white font-bold py-3.5 rounded-xl hover:bg-slate-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
          >
            Verify Identity <ChevronRight size={18} />
          </button>
        </form>
        
        {/* Footer Hint */}
        <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-medium">Demo Access Code: <span className="font-mono text-slate-600 bg-slate-200 px-1 py-0.5 rounded">2024</span></p>
        </div>
      </div>
    </div>
  );
};

export default LandlordAuth;
