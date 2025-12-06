
import React, { useState } from 'react';
import { Camera, FileText, Upload, ArrowRight } from 'lucide-react';

interface Props {
  onExtract: (input: string | File) => void;
  isProcessing: boolean;
}

const AddRent: React.FC<Props> = ({ onExtract, isProcessing }) => {
  const [activeTab, setActiveTab] = useState<'sms' | 'image'>('sms');
  const [smsText, setSmsText] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onExtract(e.target.files[0]);
    }
  };

  const handleSmsSubmit = () => {
    if (smsText.trim()) {
      onExtract(smsText);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Add Payment</h2>
        <p className="text-slate-500">Extract details from MoMo SMS or Receipt.</p>
      </div>

      {/* Tabs */}
      <div className="bg-white p-1 rounded-xl border border-slate-200 flex">
        <button
          onClick={() => setActiveTab('sms')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'sms' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Paste SMS
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'image' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Upload Image
        </button>
      </div>

      {/* Content */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[300px]">
        
        {activeTab === 'sms' ? (
          <div className="space-y-4 h-full flex flex-col">
            <label className="block text-sm font-semibold text-slate-700">Paste Transaction Message</label>
            <textarea
              className="w-full flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono"
              placeholder="e.g. *182*... TxId: 12345 Payment of 150,000 RWF to Jean Claude..."
              rows={8}
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
            />
            <button
              onClick={handleSmsSubmit}
              disabled={!smsText.trim() || isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Analyzing...' : <>Analyze Text <ArrowRight size={18} /></>}
            </button>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center space-y-6 py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Camera size={32} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-700">Upload Receipt or Agreement</p>
              <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG (Max 5MB)</p>
            </div>
            <label className="cursor-pointer">
               <input 
                 type="file" 
                 accept="image/*" 
                 className="hidden" 
                 onChange={handleFileChange}
                 disabled={isProcessing}
               />
               <span className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-block">
                 {isProcessing ? 'Uploading...' : 'Choose Photo'}
               </span>
            </label>
          </div>
        )}

      </div>

      {/* Helper Tip */}
      <div className="bg-amber-50 p-4 rounded-xl flex gap-3">
        <div className="text-amber-500 mt-1">
          <FileText size={18} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-800">Pro Tip</h4>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            For best results with paper receipts, ensure good lighting and that the handwritten amount is clearly visible. The AI can read Kinyarwanda!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddRent;
