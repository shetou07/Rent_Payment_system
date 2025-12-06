
import React from 'react';
import { RentRecord, PaymentMethod, DocumentType } from '../types';
import { CheckCircle2, FileText, Smartphone, Banknote } from 'lucide-react';

interface Props {
  records: RentRecord[];
}

const History: React.FC<Props> = ({ records }) => {
  const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.MOMO:
      case PaymentMethod.AIRTEL:
        return <Smartphone size={18} />;
      case PaymentMethod.CASH:
        return <Banknote size={18} />;
      default:
        return <FileText size={18} />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">History</h2>
        <p className="text-slate-500">Your verified payment log.</p>
      </div>

      <div className="space-y-4">
        {sortedRecords.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>No records found.</p>
          </div>
        ) : (
          sortedRecords.map((record) => (
            <div key={record.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group">
              {/* Optional: Verified Badge Background Effect */}
              {record.isVerified && (
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <CheckCircle2 size={64} className="text-green-500" />
                </div>
              )}

              <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span className={`p-2 rounded-lg ${
                    record.paymentMethod === PaymentMethod.MOMO ? 'bg-yellow-100 text-yellow-700' :
                    record.paymentMethod === PaymentMethod.AIRTEL ? 'bg-red-100 text-red-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {getIcon(record.paymentMethod)}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-800">{record.description}</h3>
                    <p className="text-xs text-slate-500">To: {record.landlordName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-slate-800">
                    {record.amount.toLocaleString()} <span className="text-xs font-normal text-slate-500">{record.currency}</span>
                  </p>
                  <p className="text-xs text-slate-400">{record.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50 relative z-10">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Source</span>
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {record.documentType === DocumentType.SMS ? 'SMS Parser' : 'OCR Scan'}
                  </span>
                </div>
                
                {record.isVerified && (
                  <div className="flex items-center gap-1.5 ml-auto text-green-600">
                    <CheckCircle2 size={14} />
                    <span className="text-xs font-bold">Verified</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
