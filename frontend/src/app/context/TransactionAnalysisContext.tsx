import { createContext, useContext, useState, ReactNode } from 'react';

export interface SubmittedTransaction {
  risk: number;
  confidence: number;
  time: string;       // "HH:MM"
  label: string;
  amount: number;
  model: string;
  category: string;
  customerId: string;
}

export interface TransactionAnalysisData {
  transaction1: SubmittedTransaction | null;
  transaction2: SubmittedTransaction | null;
}

interface TransactionAnalysisContextType {
  analysisData: TransactionAnalysisData;
  setAnalysisData: (data: TransactionAnalysisData) => void;
  clearAnalysisData: () => void;
}

const defaultData: TransactionAnalysisData = {
  transaction1: null,
  transaction2: null,
};

const TransactionAnalysisContext = createContext<TransactionAnalysisContextType>({
  analysisData: defaultData,
  setAnalysisData: () => {},
  clearAnalysisData: () => {},
});

export function TransactionAnalysisProvider({ children }: { children: ReactNode }) {
  const [analysisData, setAnalysisData] = useState<TransactionAnalysisData>(defaultData);

  const clearAnalysisData = () => setAnalysisData(defaultData);

  return (
    <TransactionAnalysisContext.Provider value={{ analysisData, setAnalysisData, clearAnalysisData }}>
      {children}
    </TransactionAnalysisContext.Provider>
  );
}

export function useTransactionAnalysis() {
  return useContext(TransactionAnalysisContext);
}
