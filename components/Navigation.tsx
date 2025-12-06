
import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, PlusCircle, History } from 'lucide-react';

interface Props {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

const Navigation: React.FC<Props> = ({ currentView, onChangeView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-6 z-40">
      <div className="flex justify-around items-center max-w-md mx-auto h-16">
        <button
          onClick={() => onChangeView('dashboard')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentView === 'dashboard' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <LayoutDashboard size={24} strokeWidth={currentView === 'dashboard' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Overview</span>
        </button>

        <button
          onClick={() => onChangeView('add')}
          className="flex flex-col items-center gap-1 -mt-8"
        >
          <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${
            currentView === 'add' ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white'
          }`}>
             <PlusCircle size={32} />
          </div>
          <span className={`text-[10px] font-medium ${currentView === 'add' ? 'text-blue-600' : 'text-slate-400'}`}>Add New</span>
        </button>

        <button
          onClick={() => onChangeView('history')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentView === 'history' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <History size={24} strokeWidth={currentView === 'history' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">History</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
