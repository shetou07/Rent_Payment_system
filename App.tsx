import React, { useState } from 'react';
import { ViewState, RentRecord, ExtractionResult, PaymentMethod, DocumentType, UserRole } from './types';
import Dashboard from './components/Dashboard';
import LandlordDashboard from './components/LandlordDashboard';
import AddRent from './components/AddRent';
import History from './components/History';
import Navigation from './components/Navigation';
import ExtractionModal from './components/ExtractionModal';
import { extractRentDetails } from './services/geminiService';
import { UserCircle2 } from 'lucide-react';

// Mock Data for initial state
const MOCK_RECORDS: RentRecord[] = [
  {
    id: '1',
    amount: 150000,
    currency: 'RWF',
    date: '2023-10-01',
    landlordName: 'Jean Claude',
    tenantName: 'Me',
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
    tenantName: 'Me',
    paymentMethod: PaymentMethod.MOMO,
    description: 'Rent September',
    isVerified: true,
    confidenceScore: 95,
    documentType: DocumentType.SMS
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [role, setRole] = useState<UserRole>('tenant');
  const [records, setRecords] = useState<RentRecord[]>(MOCK_RECORDS);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [extractionData, setExtractionData] = useState<ExtractionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExtract = async (input: string | File) => {
    setIsProcessing(true);
    setIsModalOpen(true);
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
    setIsModalOpen(false);
    setView('history');
  };

  const toggleRole = () => {
    setRole(prev => prev === 'tenant' ? 'landlord' : 'tenant');
    setView('dashboard'); // Reset to dashboard on switch
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold transition-colors ${role === 'tenant' ? 'bg-blue-600' : 'bg-slate-800'}`}>
            K
          </div>
          <h1 className="font-bold text-lg tracking-tight text-slate-800">
            {role === 'tenant' ? 'Rent Intel' : 'Landlord Pro'}
          </h1>
        </div>
        
        <button 
          onClick={toggleRole}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-xs font-bold text-slate-600 border border-slate-200"
        >
          <UserCircle2 size={16} />
          {role === 'tenant' ? 'Tenant View' : 'Landlord View'}
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

      {/* Extraction Modal */}
      <ExtractionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmRecord}
        extractionData={extractionData}
        isProcessing={isProcessing}
      />

      {/* Bottom Navigation */}
      <Navigation currentView={view} onChangeView={setView} />
    </div>
  );
};

export default App;