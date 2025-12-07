
import React, { useState, useEffect } from 'react';
import { RentRecord, Unit, PaymentMethod, DocumentType } from '../types';
import { Users, Wallet, AlertCircle, ArrowDownRight, Smartphone, Banknote, Plus, X, MessageCircle, Edit2, Trash2, CheckCircle2, Mail, UserMinus, Key, Home } from 'lucide-react';
import ReceiptModal from './ReceiptModal';

interface Props {
  records: RentRecord[];
  units: Unit[];
  onAddClick: () => void;
  onAddUnit: (unit: Unit) => void;
  onUpdateUnit: (unit: Unit) => void;
  onDeleteUnit: (id: string) => void;
  onAddRecord: (record: RentRecord) => void;
}

const LandlordDashboard: React.FC<Props> = ({ records, units, onAddClick, onAddUnit, onUpdateUnit, onDeleteUnit, onAddRecord }) => {
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [filter, setFilter] = useState<'all' | 'late' | 'paid' | 'vacant'>('all');
  
  // Receipt State
  const [receiptData, setReceiptData] = useState<{record: RentRecord, unit: Unit} | null>(null);

  // --- Dynamic Calculation Logic ---
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentDay = new Date().getDate();

  const currentMonthRecords = records.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalCollected = currentMonthRecords.reduce((acc, curr) => acc + curr.amount, 0);
  
  const expectedRevenue = units.reduce((acc, unit) => {
    return (unit.tenantName && unit.tenantName !== 'Vacant') ? acc + unit.rentAmount : acc;
  }, 0);
  
  const collectionRate = expectedRevenue > 0 ? Math.round((totalCollected / expectedRevenue) * 100) : 0;
  
  const occupiedCount = units.filter(u => u.tenantName && u.tenantName !== 'Vacant').length;
  const occupancyRate = units.length > 0 ? Math.round((occupiedCount / units.length) * 100) : 0;

  // --- Helper to get status ---
  const getUnitStatus = (unit: Unit) => {
    if (!unit.tenantName || unit.tenantName === 'Vacant') return 'vacant';

    const hasPaid = currentMonthRecords.some(r => 
      r.tenantName.toLowerCase().includes(unit.tenantName.toLowerCase()) || 
      unit.tenantName.toLowerCase().includes(r.tenantName.toLowerCase())
    );

    if (hasPaid) return 'paid';
    if (currentDay > unit.dueDateDay) return 'late';
    return 'pending';
  };

  const filteredUnits = units.filter(u => {
    const status = getUnitStatus(u);
    if (filter === 'all') return true;
    if (filter === 'late') return status === 'late' || status === 'pending';
    return status === filter;
  });

  const handleQuickPay = (unit: Unit) => {
    const confirmed = window.confirm(`Confirm CASH payment of ${unit.rentAmount.toLocaleString()} RWF from ${unit.tenantName}?`);
    if (confirmed) {
        const newRecord: RentRecord = {
            id: crypto.randomUUID(),
            amount: unit.rentAmount,
            currency: 'RWF',
            date: new Date().toISOString().split('T')[0],
            landlordName: 'Me',
            tenantName: unit.tenantName,
            paymentMethod: PaymentMethod.CASH,
            description: `Rent ${new Date().toLocaleString('default', { month: 'long' })} - ${unit.name}`,
            isVerified: false,
            confidenceScore: 100,
            documentType: DocumentType.OTHER
        };
        onAddRecord(newRecord);
        // Trigger Receipt Modal
        setReceiptData({ record: newRecord, unit: unit });
    }
  };

  const handleWhatsApp = (unit: Unit) => {
      if (!unit.tenantPhone) {
          alert("No phone number for this tenant.");
          return;
      }
      const message = `Hello ${unit.tenantName}, this is a reminder that rent for ${unit.name} (${unit.rentAmount} RWF) is due. Please pay via MoMo or Cash.`;
      window.open(`https://wa.me/25${unit.tenantPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-4">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Portfolio Overview</h2>
          <p className="text-slate-500">Kigali Properties</p>
        </div>
        <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${occupancyRate >= 90 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {occupancyRate}% Occ.
            </span>
        </div>
      </div>

      {/* Revenue Chart (CSS only for simplicity) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
           <h3 className="font-bold text-slate-700">Revenue Trend</h3>
           <span className="text-xs font-bold text-slate-400 uppercase">Last 6 Months</span>
        </div>
        <div className="h-32 flex items-end justify-between gap-2">
            {[65, 59, 80, 81, 56, collectionRate].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div 
                        className={`w-full rounded-t-lg transition-all ${i === 5 ? 'bg-blue-600' : 'bg-slate-200 group-hover:bg-slate-300'}`} 
                        style={{ height: `${Math.max(val, 10)}%` }}
                    ></div>
                    <span className="text-[10px] text-slate-400 font-medium">
                        {['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'][i]}
                    </span>
                </div>
            ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
             <div>
                <p className="text-xs text-slate-400 font-medium">Expected</p>
                <p className="font-bold text-slate-700">{expectedRevenue.toLocaleString()}</p>
             </div>
             <div className="text-right">
                <p className="text-xs text-slate-400 font-medium">Collected</p>
                <p className="font-bold text-green-600">{totalCollected.toLocaleString()}</p>
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
        <button 
          onClick={() => { setSelectedUnit(null); setShowManageModal(true); }}
          className="p-4 bg-white border border-slate-200 text-slate-700 rounded-xl active:scale-95 transition-all flex flex-col items-center justify-center gap-2 hover:bg-slate-50"
        >
          <Plus size={24} className="text-blue-500" />
          <span className="font-semibold text-sm">Add Unit</span>
        </button>
      </div>

      {/* Unit List Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-700">Units</h3>
            {/* Filters */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
                {(['all', 'late', 'paid', 'vacant'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>
        </div>

        <div className="space-y-3">
          {filteredUnits.length === 0 ? (
             <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-slate-100 border-dashed">
                 <p>No units found for this filter.</p>
             </div>
          ) : (
            filteredUnits.map(unit => {
                const status = getUnitStatus(unit);
                return (
                <div key={unit.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative group overflow-hidden">
                    
                    {/* Main Card Content */}
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => { setSelectedUnit(unit); setShowManageModal(true); }}>
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base transition-colors ${
                                status === 'paid' ? 'bg-green-100 text-green-700' : 
                                status === 'late' ? 'bg-red-100 text-red-700' : 
                                status === 'vacant' ? 'bg-slate-100 text-slate-400' :
                                'bg-amber-100 text-amber-700'
                            }`}>
                                {unit.name.substring(0,2).toUpperCase()}
                            </div>
                            <div>
                                <p className={`font-bold ${status === 'vacant' ? 'text-slate-400 italic' : 'text-slate-800'}`}>
                                {unit.tenantName || 'Vacant'}
                                </p>
                                <p className="text-xs text-slate-500 font-medium">
                                {unit.name} • {unit.rentAmount.toLocaleString()} RWF
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            {status === 'paid' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">
                                PAID
                                </span>
                            )}
                            {status === 'late' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
                                LATE
                                </span>
                            )}
                            {status === 'pending' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                PENDING
                                </span>
                            )}
                            {status === 'vacant' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                VACANT
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions Row */}
                    {(status === 'late' || status === 'pending') && (
                        <div className="mt-3 pt-3 border-t border-slate-50 flex gap-2">
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleQuickPay(unit); }}
                                className="flex-1 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                             >
                                <Banknote size={14} /> Mark Paid (Cash)
                             </button>
                             {unit.tenantPhone && (
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); handleWhatsApp(unit); }}
                                    className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                                 >
                                    <MessageCircle size={14} /> Remind
                                 </button>
                             )}
                        </div>
                    )}

                </div>
                );
            })
          )}
        </div>
      </div>

      {/* Edit/Add Unit Modal */}
      {showManageModal && (
        <ManageUnitsModal 
           unit={selectedUnit}
           onClose={() => setShowManageModal(false)} 
           onSave={(u) => { 
             if (selectedUnit) onUpdateUnit(u); 
             else onAddUnit(u); 
             setShowManageModal(false); 
           }}
           onDelete={(id) => {
             onDeleteUnit(id);
             setShowManageModal(false);
           }}
        />
      )}

      {/* Receipt Modal */}
      {receiptData && (
        <ReceiptModal
            isOpen={true}
            onClose={() => setReceiptData(null)}
            record={receiptData.record}
            tenantEmail={receiptData.unit.tenantEmail}
            tenantPhone={receiptData.unit.tenantPhone}
        />
      )}

    </div>
  );
};

// --- Internal Component for Adding/Editing Units ---
const ManageUnitsModal: React.FC<{ 
    unit: Unit | null, 
    onClose: () => void, 
    onSave: (u: Unit) => void,
    onDelete: (id: string) => void
}> = ({ unit, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<Unit>>(
    unit || { rentAmount: 150000, dueDateDay: 1, name: '' }
  );

  // Determine initial status based on whether a tenant name exists and isn't "Vacant"
  const [occupancyStatus, setOccupancyStatus] = useState<'occupied' | 'vacant'>(
    (unit?.tenantName && unit.tenantName !== 'Vacant') ? 'occupied' : 'vacant'
  );

  // Sync formData when toggling status
  useEffect(() => {
    if (occupancyStatus === 'vacant') {
        // Don't clear immediately to allow undo, but visual toggle logic handles the view
    }
  }, [occupancyStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.rentAmount) return;
    
    // Logic to finalize data based on status
    const finalTenantName = occupancyStatus === 'occupied' ? (formData.tenantName || 'Unknown Tenant') : 'Vacant';
    const finalTenantPhone = occupancyStatus === 'occupied' ? formData.tenantPhone : '';
    const finalTenantEmail = occupancyStatus === 'occupied' ? formData.tenantEmail : '';

    onSave({
      id: unit?.id || crypto.randomUUID(),
      name: formData.name,
      tenantName: finalTenantName,
      tenantPhone: finalTenantPhone,
      tenantEmail: finalTenantEmail,
      rentAmount: Number(formData.rentAmount),
      dueDateDay: Number(formData.dueDateDay)
    });
  };

  const handleMoveOut = () => {
    if(window.confirm("Are you sure you want to end the lease? This will clear tenant details.")) {
        setOccupancyStatus('vacant');
        setFormData({
            ...formData,
            tenantName: '',
            tenantPhone: '',
            tenantEmail: ''
        });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">{unit ? 'Edit Unit Details' : 'Add New Unit'}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          
          {/* Unit Details Section */}
          <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unit Name</label>
                <div className="relative">
                    <Home className="absolute left-3 top-3.5 text-slate-400" size={16} />
                    <input 
                    className="w-full pl-9 p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-700" 
                    placeholder="e.g. Apt 3B"
                    value={formData.name || ''} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required
                    />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rent (RWF)</label>
                  <input 
                    type="number"
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm font-mono font-medium focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.rentAmount} onChange={e => setFormData({...formData, rentAmount: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Due Day</label>
                  <input 
                    type="number" min="1" max="31"
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.dueDateDay} onChange={e => setFormData({...formData, dueDateDay: Number(e.target.value)})}
                  />
                </div>
            </div>
          </div>

          {/* Occupancy Status Switch */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Occupancy Status</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                    type="button"
                    onClick={() => setOccupancyStatus('occupied')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        occupancyStatus === 'occupied' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-600'
                    }`}
                >
                    <Key size={14} /> Occupied
                </button>
                <button
                    type="button"
                    onClick={() => {
                        if (occupancyStatus === 'occupied' && formData.tenantName && formData.tenantName !== 'Vacant') {
                             // If moving from occupied to vacant, suggest move out
                             handleMoveOut();
                        } else {
                            setOccupancyStatus('vacant');
                        }
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        occupancyStatus === 'vacant' 
                        ? 'bg-white text-slate-800 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-600'
                    }`}
                >
                    <UserMinus size={14} /> Vacant
                </button>
            </div>
          </div>

          {/* Conditional Tenant Form */}
          {occupancyStatus === 'occupied' ? (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                    <Users size={16} className="text-blue-500" />
                    <span className="text-xs font-bold text-blue-700 uppercase">Tenant Details</span>
                </div>
                <div>
                    <input 
                    className="w-full p-3 border border-blue-200 bg-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Tenant Name"
                    value={formData.tenantName === 'Vacant' ? '' : formData.tenantName || ''} 
                    onChange={e => setFormData({...formData, tenantName: e.target.value})}
                    required
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                        <Smartphone className="absolute left-3 top-3.5 text-slate-400" size={16} />
                        <input 
                        className="w-full pl-9 p-3 border border-blue-200 bg-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="Phone"
                        value={formData.tenantPhone || ''} 
                        onChange={e => setFormData({...formData, tenantPhone: e.target.value})}
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-slate-400" size={16} />
                        <input 
                        className="w-full pl-9 p-3 border border-blue-200 bg-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="Email"
                        value={formData.tenantEmail || ''} 
                        onChange={e => setFormData({...formData, tenantEmail: e.target.value})}
                        />
                    </div>
                </div>
                
                {/* Move Out Button (only if editing existing tenant) */}
                {unit && unit.tenantName && unit.tenantName !== 'Vacant' && (
                    <button 
                        type="button"
                        onClick={handleMoveOut}
                        className="w-full py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-dashed border-red-200"
                    >
                        End Lease & Move Out
                    </button>
                )}
            </div>
          ) : (
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 border-dashed text-center animate-fade-in">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400">
                    <Home size={20} />
                </div>
                <p className="text-sm font-medium text-slate-600">Unit is currently vacant.</p>
                <p className="text-xs text-slate-400 mt-1">Ready for a new tenant.</p>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-3">
            <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                {unit ? <><CheckCircle2 size={18} /> Save Changes</> : <><Plus size={18} /> Add Unit</>}
            </button>
            
            {unit && (
                <button 
                  type="button"
                  onClick={() => { if(window.confirm('Delete this unit completely? This cannot be undone.')) onDelete(unit.id); }}
                  className="w-full py-3 bg-white border border-red-100 text-red-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
                >
                    <Trash2 size={18} /> Delete Unit
                </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LandlordDashboard;
