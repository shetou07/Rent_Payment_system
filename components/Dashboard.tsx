
import React from 'react';
import { RentRecord } from '../types';
import { TrendingUp, Calendar, AlertCircle, ArrowRight } from 'lucide-react';

interface Props {
  records: RentRecord[];
  onAddClick: () => void;
}

const Dashboard: React.FC<Props> = ({ records, onAddClick }) => {
  // Simple logic to find latest date and project next month
  const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastPayment = sortedRecords[0];
  
  let nextDueDate = new Date();
  if (lastPayment) {
    const d = new Date(lastPayment.date);
    d.setMonth(d.getMonth() + 1);
    nextDueDate = d;
  }

  const daysUntilDue = Math.ceil((nextDueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isLate = daysUntilDue < 0;
  const isDueSoon = daysUntilDue <= 5 && daysUntilDue >= 0;

  const totalPaid = records.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Muraho, Tenant! 👋</h2>
        <p className="text-slate-500">Here is your rent summary.</p>
      </div>

      {/* Next Due Card */}
      <div className={`p-6 rounded-2xl shadow-sm border ${
        isLate ? 'bg-red-50 border-red-100' : 
        isDueSoon ? 'bg-amber-50 border-amber-100' : 'bg-blue-600 text-white border-blue-600'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className={`text-sm font-medium ${isLate || isDueSoon ? 'text-slate-500' : 'text-blue-100'}`}>Next Payment Due</p>
            <h3 className={`text-3xl font-bold mt-1 ${isLate ? 'text-red-600' : isDueSoon ? 'text-amber-600' : 'text-white'}`}>
              {nextDueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
            </h3>
          </div>
          <Calendar className={isLate ? 'text-red-400' : isDueSoon ? 'text-amber-400' : 'text-blue-200'} size={24} />
        </div>
        
        <div className="flex items-center gap-2">
           {isLate ? (
             <span className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
               <AlertCircle size={12} /> Overdue by {Math.abs(daysUntilDue)} days
             </span>
           ) : (
             <span className={`text-xs px-2 py-1 rounded-full font-bold ${
               isDueSoon ? 'bg-amber-200 text-amber-800' : 'bg-blue-500 text-white'
             }`}>
               {daysUntilDue} days remaining
             </span>
           )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <TrendingUp size={16} />
            <span className="text-xs font-semibold uppercase">Total Paid</span>
          </div>
          <p className="text-lg font-bold text-slate-800">
            {totalPaid.toLocaleString()} <span className="text-xs text-slate-500 font-normal">RWF</span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm" onClick={onAddClick}>
          <div className="h-full flex flex-col justify-center items-center text-blue-600 cursor-pointer hover:bg-blue-50 transition-colors rounded-lg">
             <span className="text-2xl font-bold">+</span>
             <span className="text-sm font-medium">Log Payment</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Mini List */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-slate-700">Recent Activity</h3>
          <button onClick={() => {}} className="text-xs text-blue-600 font-medium flex items-center">
            View All <ArrowRight size={12} className="ml-1" />
          </button>
        </div>
        <div className="space-y-3">
          {sortedRecords.slice(0, 3).map(record => (
            <div key={record.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">
                  {record.paymentMethod.includes('MOMO') ? '📱' : '💵'}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{record.description}</p>
                  <p className="text-xs text-slate-500">{record.date}</p>
                </div>
              </div>
              <span className="font-mono font-bold text-slate-700">
                -{record.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
