import { fetchHelper } from "../../../shared/utils/apiHelpers";
import { TransactionPublic } from "../../dashboard/services/api";

export interface TransactionCreatePayload {
  amount:          number;
  time:            string;        
  category:        string;        // e.g. "es_tech"
  merchant_name:   string;
  customer_id:   number | null;        // e.g. 1
  device_name:     string;
  customer_dob:    string;        // "YYYY-MM-DD"
  customer_gender: 'M' | 'F' | 'U';
  model_key:        string;        // e.g. "model_v1"
}

export async function apiCreateTransaction(
  payload: TransactionCreatePayload,
): Promise<string> {
  return await fetchHelper<string>('/transactions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiMockTransactions(): Promise<void> {
  await fetchHelper<void>('/transactions/mock', {
    method: 'GET',
  });
}