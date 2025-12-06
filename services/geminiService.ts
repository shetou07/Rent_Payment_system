import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult, PaymentMethod, DocumentType } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `
You are an expert financial data extraction assistant for the Rwandan rental market. 
Your job is to parse unstructured text (SMS notifications from MTN MoMo or Airtel Money) and images (photos of receipts or rental agreements).
The input language might be English, Kinyarwanda, or French.

Key entities to extract:
1. Amount (Numeric value)
2. Currency (Default to RWF if not specified, but look for $, USD, Frw)
3. Date (ISO 8601 format YYYY-MM-DD)
4. Landlord Name (Recipient)
5. Tenant Name (Sender - often 'Self' if implied from SMS)
6. Payment Method (Classify as MOMO, AIRTEL, CASH, or BANK)
7. Document Type (SMS, RECEIPT, AGREEMENT)

For MoMo/Airtel SMS, look for patterns like "TxId: ... Payment of X to Y".
For Receipts, look for "Recu", "Receipt", "Amazina", "Amakote".

Return a confidence score (0-100) based on how many fields were successfully found.
`;

export const extractRentDetails = async (
  inputData: string | File
): Promise<ExtractionResult> => {
  try {
    const parts: any[] = [];

    if (typeof inputData === "string") {
      parts.push({ text: inputData });
    } else {
      // Handle Image File
      const base64Data = await fileToGenerativePart(inputData);
      parts.push(base64Data);
      parts.push({ text: "Analyze this image for rent payment details." });
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        role: "user",
        parts: parts,
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER, description: "The numerical amount paid" },
            currency: { type: Type.STRING, description: "Currency code e.g. RWF" },
            date: { type: Type.STRING, description: "Date of transaction YYYY-MM-DD" },
            landlordName: { type: Type.STRING, description: "Name of the person receiving money" },
            tenantName: { type: Type.STRING, description: "Name of the person paying" },
            paymentMethod: { type: Type.STRING, description: "One of: MOMO, AIRTEL, CASH, BANK, UNKNOWN" },
            documentType: { type: Type.STRING, description: "One of: SMS, RECEIPT, AGREEMENT" },
            confidenceScore: { type: Type.NUMBER, description: "Confidence score 0-100" },
            summary: { type: Type.STRING, description: "Brief summary of the transaction in English" },
          },
          required: ["amount", "currency", "paymentMethod", "confidenceScore"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);

    // Map string response to Enums safely
    const mapMethod = (m: string): PaymentMethod => {
      const upper = m?.toUpperCase();
      if (upper?.includes("MOMO") || upper?.includes("MTN")) return PaymentMethod.MOMO;
      if (upper?.includes("AIRTEL")) return PaymentMethod.AIRTEL;
      if (upper?.includes("CASH")) return PaymentMethod.CASH;
      if (upper?.includes("BANK")) return PaymentMethod.BANK;
      return PaymentMethod.UNKNOWN;
    };

    const mapDocType = (d: string): DocumentType => {
      const upper = d?.toUpperCase();
      if (upper?.includes("SMS")) return DocumentType.SMS;
      if (upper?.includes("RECEIPT") || upper?.includes("RECU")) return DocumentType.RECEIPT;
      if (upper?.includes("AGREEMENT")) return DocumentType.AGREEMENT;
      return DocumentType.OTHER;
    };

    return {
      amount: data.amount || null,
      currency: data.currency || "RWF",
      date: data.date || new Date().toISOString().split('T')[0],
      landlordName: data.landlordName || "Unknown Landlord",
      tenantName: data.tenantName || "Me",
      paymentMethod: mapMethod(data.paymentMethod),
      documentType: mapDocType(data.documentType),
      confidenceScore: data.confidenceScore || 0,
      summary: data.summary || "Transaction processed",
    };

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    return {
      amount: null,
      currency: "RWF",
      date: null,
      landlordName: null,
      tenantName: null,
      paymentMethod: PaymentMethod.UNKNOWN,
      documentType: DocumentType.OTHER,
      confidenceScore: 0,
      summary: "Failed to extract data. Please try again.",
    };
  }
};

async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
