export enum PaymentMethod {
  MOMO = 'Mobile Money (MTN)',
  AIRTEL = 'Airtel Money',
  CASH = 'Cash / Hand',
  BANK = 'Bank Transfer',
  UNKNOWN = 'Unknown'
}

export enum DocumentType {
  SMS = 'SMS Notification',
  RECEIPT = 'Paper Receipt',
  AGREEMENT = 'Rental Agreement',
  OTHER = 'Other'
}

export interface RentRecord {
  id: string;
  amount: number;
  currency: string;
  date: string; // ISO Date
  landlordName: string;
  tenantName: string;
  paymentMethod: PaymentMethod;
  description: string;
  isVerified: boolean; // "Blockchain" verification status
  confidenceScore: number; // 0-100 from AI
  originalText?: string; // For SMS
  documentType: DocumentType;
}

export interface ExtractionResult {
  amount: number | null;
  currency: string;
  date: string | null;
  landlordName: string | null;
  tenantName: string | null;
  paymentMethod: PaymentMethod;
  documentType: DocumentType;
  confidenceScore: number;
  summary: string;
}

export type ViewState = 'dashboard' | 'add' | 'history' | 'settings';

export type UserRole = 'tenant' | 'landlord';