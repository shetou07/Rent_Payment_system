import React, { useState, useEffect } from 'react';
import { ExtractionResult, RentRecord, PaymentMethod, DocumentType } from '../types';
import { Check, X, AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (record: RentRecord) => void;
  extractionData: ExtractionResult | null;
  isProcessing: boolean;
}

const ExtractionModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, extractionData, isProcessing }) => {
  const [editedData, setEditedData] = useState<Partial<RentRecord>>({});

  useEffect(() => {
    if (extractionData) {
      setEditedData({
        amount: extractionData.amount || 0,
        currency: extractionData.currency,
        date: extractionData.date || new Date().toISOString().split('T')[0],
        landlordName: extractionData.landlordName || '',
        paymentMethod: extractionData.paymentMethod,
        description: extractionData.summary,
        documentType: extractionData.documentType,
        confidenceScore: extractionData.confidenceScore
      });
    }
  }, [extractionData]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!editedData) return;
    
    const newRecord: RentRecord = {
      id: crypto.randomUUID(),
      amount: Number(editedData.amount),
      currency: editedData.currency || 'RWF',
      date: editedData.date || new Date().toISOString().split('T')[0],
      landlordName: editedData.landlordName || 'Unknown',
      tenantName: editedData.tenantName || 'Me',
      paymentMethod: editedData.paymentMethod || PaymentMethod.CASH,
      description: editedData.description || 'Rent Payment',
      isVerified: false,
      confidenceScore: editedData.confidenceScore || 100,
      documentType: editedData.documentType || DocumentType.OTHER,
    };
    onConfirm(newRecord);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
          <h3 className="text-lg font-bold text-slate-800">Review Extraction</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-slate-600 font-medium text-center">
                Analyzing document with Gemini...<br/>
                <span className="text-sm text-slate-400">Reading Kinyarwanda/English/French</span>
              </p>
            </div>
          ) : extractionData ? (
            <>
              {/* Confidence Badge */}
              <div className={`p-3 rounded-lg flex items-center gap-3 ${
                (extractionData.confidenceScore || 0) > 80 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
              }`}>
                <AlertTriangle size={20} />
                <div className="text-sm">
                  <p className="font-bold">AI Confidence: {extractionData.confidenceScore}%</p>
                  <p className="opacity-80">Please verify the details below.</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Amount (RWF)</label>
                  <input
                    type="number"
                    value={editedData.amount || ''}
                    onChange={e => setEditedData({...editedData, amount: Number(e.target.value)})}
                    className="w-full p-3 border border-slate-200 rounded-lg font-mono text-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Date</label>
                    <input
                      type="date"
                      value={editedData.date || ''}
                      onChange={e => setEditedData({...editedData, date: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Method</label>
                    <select
                      value={editedData.paymentMethod}
                      onChange={e => setEditedData({...editedData, paymentMethod: e.target.value as PaymentMethod})}
                      className="w-full p-3 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      {Object.values(PaymentMethod).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Landlord Name</label>
                  <input
                    type="text"
                    value={editedData.landlordName || ''}
                    onChange={e => setEditedData({...editedData, landlordName: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                   <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Summary / Note</label>
                   <textarea
                     value={editedData.description || ''}
                     onChange={e => setEditedData({...editedData, description: e.target.value})}
                     className="w-full p-3 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                     rows={2}
                   />
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-red-500">
               <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-red-400" />
               <p>Extraction failed or no data found.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors">
              Cancel
            </button>
            <button 
               onClick={handleSave}
               disabled={isProcessing || !extractionData}
               className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Check size={18} /> Confirm & Save
            </button>
        </div>
      </div>
    </div>
  );
};

export default ExtractionModal;