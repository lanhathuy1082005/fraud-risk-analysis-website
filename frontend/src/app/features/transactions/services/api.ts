import { fetchHelper } from "../../../shared/utils/apiHelpers";
import { TransactionPublic } from "../../dashboard/services/api";

export interface TransactionCreatePayload {
  amount:          number;
  time:            string;        // ISO 8601
  category:        string;        // e.g. "es_tech"
  merchant_name:   string;
  customer_name:   string;
  customer_dob:    string;        // "YYYY-MM-DD"
  customer_gender: 'M' | 'F' | 'U';
}

export async function apiCreateTransaction(
  payload: TransactionCreatePayload,
): Promise<TransactionPublic> {
  return await fetchHelper<TransactionPublic>('/transactions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}