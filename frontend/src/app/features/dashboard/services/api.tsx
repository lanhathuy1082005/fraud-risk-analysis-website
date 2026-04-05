import { fetchHelper } from "../../../shared/utils/apiHelpers";

// ─── transaction endpoints ────────────────────────────────────────────────────

/**
 * Shared types that mirror the backend TransactionPublic schema.
 */
export interface TransactionPublic {
  id:           number;
  uuid:          string;
  amount:        number;
  time:          string;
  category:      string;
  merchant_name: string;
  customer_name: string;
  risk:          number;
  confidence:    number;
  status:        string| null;
}

export interface DashboardStats {
  avg_amount_24h: number;
  txn_count_24h: number;
  high_conf_high_risk_txn_count: number;
}

/**
 * POST /transactions
 * Create a new transaction record.
 */

/**
 * GET /transactions
 * Retrieve all transactions (with optional filtering in future).
 */
export async function apiGetTransactions(): Promise<TransactionPublic[]> {
  return await fetchHelper<TransactionPublic[]>('/transactions');
}

/**
 * POST /reviews
 * Submit a review for a transaction (approve/reject).
 * Payload: { transaction_uuid: string, decision: 'approved' | 'blocked' }
 */
export async function apiReviewTransaction(payload: { transaction_id: number, status: 'approved' | 'blocked' }): Promise<void> {
  await fetchHelper<void>(`/reviews`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiGetDashboardStats(): Promise<DashboardStats> {
  return await fetchHelper<DashboardStats>(`stats/dashboard/`, {
    method: 'GET',
  });
}