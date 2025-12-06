import React from 'react';
import { RentRecord, PaymentMethod } from '../types';
import { Users, Wallet, AlertCircle, ArrowUpRight, ArrowDownRight, Smartphone, Banknote } from 'lucide-react';

interface Props {
  records: RentRecord[];
  onAddClick: () => void;
}

// Mock Property Data for the Landlord View
const MOCK_UNITS = [
  { id: 'u1', name: 'Unit A1', tenant: 'Keza Marie', rentAmount: 150000, status: 'paid', lastPaid: '2023-10-01' },
  { id: 'u2', name: 'Unit A2', tenant: 'Jean Claude', rentAmount: 150000, status: 'late', lastPaid: '2023-09-02' },
  { id: 'u3', name: 'Unit B1', tenant: 'Patrick N.', rentAmount: 200000, status: 'paid', lastPaid: '2023-10-03' },
  { id: 'u4', name: 'Unit B2', tenant: 'Empty', rentAmount: 200000, status: 'vacant', lastPaid: null },
];

const LandlordDashboard: React.FC<Props> = ({ records, onAddClick }) => {
  // Calculate Financials
  const currentMonth = new Date().getMonth();
  const currentMonthRecords = records.filter(r => new Date(r.date).getMonth() === currentMonth);
  
  const totalCollected = currentMonthRecords.reduce((acc, curr) => acc + curr.amount, 0);
  const expectedRevenue = MOCK_UNITS.reduce((acc, unit) => unit.status !== 'vacant' ? acc + unit.rentAmount : acc, 0);
  const collectionRate = Math.round((totalCollected / expectedRevenue) * 100) || 0;

  const momoCount = currentMonthRecords.filter(r => r.paymentMethod.includes('MOMO') || r.paymentMethod.includes('AIRTEL')).length;
  const cashCount = currentMonthRecords.filter(r => r.paymentMethod.includes('CASH')).length;

  return (
    <div className="space-y-6 animate-fade-in pb-4">
      
      {/* Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Muraho, Landlord! 🏠</h2>
          <p className="text-slate-500">October Portfolio Overview</p>
        </div>
        <div className="text-right">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupancy</p>
           <p className="text-xl font-bold text-blue-600">75%</p>
        </div>
      </div>

      {/* Financial Health Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">Total Revenue (Oct)</p>
            <h3 className="text-3xl font-bold text-slate-800">
              {totalCollected.toLocaleString()} <span className="text-sm font-normal text-slate-500">RWF</span>
            </h3>
          </div>
          <div className={`p-2 rounded-lg ${collectionRate >= 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            <Wallet size={24} />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-2 flex justify-between text-xs font-semibold">
           <span className="text-slate-600">Collection Rate</span>
           <span className={collectionRate < 100 ? 'text-amber-600' : 'text-green-600'}>{collectionRate}% of Expected</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full ${collectionRate >= 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
            style={{ width: `${Math.min(collectionRate, 100)}%` }}
          ></div>
        </div>
        
        <div className="mt-4 flex gap-4 text-xs">
           <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
             <Smartphone size={12} className="text-yellow-600" />
             <span>MoMo: {momoCount}</span>
           </div>
           <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
             <Banknote size={12} className="text-green-600" />
             <span>Cash: {cashCount}</span>
           </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={onAddClick}
          className="p-4 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-200 active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
        >
          <ArrowDownRight size={24} />
          <span className="font-semibold text-sm">Log Payment</span>
        </button>
        <button className="p-4 bg-white border border-slate-200 text-slate-700 rounded-xl active:scale-95 transition-all flex flex-col items-center justify-center gap-2">
          <Users size={24} className="text-slate-400" />
          <span className="font-semibold text-sm">Manage Units</span>
        </button>
      </div>

      {/* Tenant Status List */}
      <div>
        <h3 className="font-bold text-slate-700 mb-3">Unit Status</h3>
        <div className="space-y-3">
          {MOCK_UNITS.map(unit => (
            <div key={unit.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
              
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  unit.status === 'paid' ? 'bg-green-100 text-green-700' : 
                  unit.status === 'late' ? 'bg-red-100 text-red-700' : 
                  'bg-slate-100 text-slate-400'
                }`}>
                  {unit.name.split(' ')[1]}
                </div>
                <div>
                  <p className={`font-semibold ${unit.status === 'vacant' ? 'text-slate-400 italic' : 'text-slate-800'}`}>
                    {unit.tenant}
                  </p>
                  <p className="text-xs text-slate-500">
                    {unit.rentAmount.toLocaleString()} RWF
                  </p>
                </div>
              </div>

              <div>
                {unit.status === 'paid' && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                    Paid
                  </span>
                )}
                {unit.status === 'late' && (
                  <div className="flex flex-col items-end">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100 gap-1">
                      <AlertCircle size={10} /> Late
                    </span>
                    <span className="text-[10px] text-red-400 mt-1">Due 2 days ago</span>
                  </div>
                )}
                {unit.status === 'vacant' && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-500 border border-slate-100">
                    Vacant
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default LandlordDashboard;