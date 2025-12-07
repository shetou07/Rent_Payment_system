
import React, { useState } from 'react';
import { ViewState, RentRecord, ExtractionResult, PaymentMethod, DocumentType, UserRole, Unit } from './types';
import Dashboard from './components/Dashboard';
import LandlordDashboard from './components/LandlordDashboard';
import AddRent from './components/AddRent';
import History from './components/History';
import Navigation from './components/Navigation';
import ExtractionModal from './components/ExtractionModal';
import LandlordAuth from './components/LandlordAuth';
import { extractRentDetails } from './services/geminiService';
import { UserCircle2, Shield } from 'lucide-react';

// Mock Data for initial state
const MOCK_RECORDS: RentRecord[] = [
  {
    id: '1',
    amount: 150000,
    currency: 'RWF',
    date: '2023-10-01',
    landlordName: 'Jean Claude',
    tenantName: 'Keza Marie',
    paymentMethod: PaymentMethod.MOMO,
    description: 'Rent October',
    isVerified: true,
    confidenceScore: 100,
    documentType: DocumentType.SMS
  },
  {
    id: '2',
    amount: 150000,
    currency: 'RWF',
    date: '2023-09-01',
    landlordName: 'Jean Claude',
    tenantName: 'Keza Marie',
    paymentMethod: PaymentMethod.MOMO,
    description: 'Rent September',
    isVerified: true,
    confidenceScore: 95,
    documentType: DocumentType.SMS
  }
];

const INITIAL_UNITS: Unit[] = [
  { id: 'u1', name: 'Unit A1 (Ground)', tenantName: 'Keza Marie', tenantPhone: '0788123456', tenantEmail: 'keza@example.com', rentAmount: 150000, dueDateDay: 1 },
  { id: 'u2', name: 'Unit A2 (Ground)', tenantName: 'Jean Claude', tenantPhone: '0788654321', tenantEmail: 'jean@example.com', rentAmount: 150000, dueDateDay: 5 },
  { id: 'u3', name: 'Unit B1 (Upper)', tenantName: 'Patrick N.', tenantPhone: '0788987654', tenantEmail: 'patrick@example.com', rentAmount: 200000, dueDateDay: 1 },
  { id: 'u4', name: 'Unit B2 (Upper)', tenantName: 'Vacant', rentAmount: 200000, dueDateDay: 1 },
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [role, setRole] = useState<UserRole>('tenant');
  const [records, setRecords] = useState<RentRecord[]>(MOCK_RECORDS);
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  
  // Auth State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLandlordAuthenticated, setIsLandlordAuthenticated] = useState(false);

  // Extraction Modal State
  const [isExtractionModalOpen, setIsExtractionModalOpen] = useState(false);
  const [extractionData, setExtractionData] = useState<ExtractionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExtract = async (input: string | File) => {
    setIsProcessing(true);
    setIsExtractionModalOpen(true);
    setExtractionData(null); // Reset previous data

    try {
      const result = await extractRentDetails(input);
      setExtractionData(result);
    } catch (error) {
      console.error("Extraction failed", error);
      // In a real app, handle error state in modal
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmRecord = (record: RentRecord) => {
    setRecords([record, ...records]);
    setIsExtractionModalOpen(false);
    setView('history');
  };

  const handleManualRecord = (record: RentRecord) => {
    setRecords([record, ...records]);
  };

  const handleAddUnit = (unit: Unit) => {
    setUnits([...units, unit]);
  };

  const handleUpdateUnit = (updatedUnit: Unit) => {
    setUnits(units.map(u => u.id === updatedUnit.id ? updatedUnit : u));
  };

  const handleDeleteUnit = (unitId: string) => {
    setUnits(units.filter(u => u.id !== unitId));
  };

  const handleRoleSwitchRequest = () => {
    if (role === 'landlord') {
      // Switching back to tenant
      setRole('tenant');
      setView('dashboard');
      // Reset auth so PIN is required next time
      setIsLandlordAuthenticated(false);
    } else {
      // Switching to landlord: Always require PIN check
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsLandlordAuthenticated(true);
    setIsAuthModalOpen(false);
    setRole('landlord');
    setView('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Top Header */}
      <header className={`border-b sticky top-0 z-10 px-4 py-3 flex justify-between items-center shadow-sm transition-colors duration-500 ${role === 'landlord' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${role === 'tenant' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-blue-400'}`}>
            K
          </div>
          <h1 className={`font-bold text-lg tracking-tight ${role === 'landlord' ? 'text-white' : 'text-slate-800'}`}>
            {role === 'tenant' ? 'Rent Intel' : 'Landlord Pro'}
          </h1>
        </div>
        
        <button 
          onClick={handleRoleSwitchRequest}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-xs font-bold border ${
            role === 'landlord' 
              ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
          }`}
        >
          {role === 'tenant' ? <UserCircle2 size={16} /> : <Shield size={16} />}
          {role === 'tenant' ? 'Tenant View' : 'Landlord Mode'}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto p-4">
        {view === 'dashboard' && role === 'tenant' && (
          <Dashboard 
            records={records} 
            onAddClick={() => setView('add')} 
          />
        )}

        {view === 'dashboard' && role === 'landlord' && (
          <LandlordDashboard
            records={records}
            units={units}
            onAddUnit={handleAddUnit}
            onUpdateUnit={handleUpdateUnit}
            onDeleteUnit={handleDeleteUnit}
            onAddRecord={handleManualRecord}
            onAddClick={() => setView('add')}
          />
        )}
        
        {view === 'add' && (
          <AddRent 
            onExtract={handleExtract} 
            isProcessing={isProcessing}
          />
        )}

        {view === 'history' && (
          <History records={records} />
        )}
      </main>

      {/* Modals */}
      <ExtractionModal
        isOpen={isExtractionModalOpen}
        onClose={() => setIsExtractionModalOpen(false)}
        onConfirm={handleConfirmRecord}
        extractionData={extractionData}
        isProcessing={isProcessing}
      />

      <LandlordAuth 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleAuthSuccess}
      />

      {/* Bottom Navigation */}
      <Navigation currentView={view} onChangeView={setView} />
    </div>
  );
};

export default App;
