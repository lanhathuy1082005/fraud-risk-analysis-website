import { fetchHelper } from "../../../shared/utils/apiHelpers";

// ─── transaction endpoints ────────────────────────────────────────────────────

/**
 * Shared types that mirror the backend TransactionPublic schema.
 */
export interface TransactionPublic {
  id:           number | null;
  uuid:          string;
  amount:        number;
  time:          string;
  category:      string;
  customer_id: number | null;
  review_id: number | null;
  merchant_name: string;
  risk_score:    number;
  confidence_score:    number;
  device_type:         string;
  transaction_status:        string| null;
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
export interface TransactionPage {
  transactions: TransactionPublic[];
  hasNextPage: boolean;
}

export async function apiGetTransactions(page = 1, limit = 10): Promise<TransactionPage> {
  const response = await fetchHelper<TransactionPublic[]>(`/transactions/?page=${page}&limit=${limit + 1}`, {}, true);
  console.log('Raw API Response:', response); // DEBUG
  console.log('First transaction:', response[0]); // DEBUG - check review_id
  const hasNextPage = response.length > limit;
  return {
    transactions: response.slice(0, limit),
    hasNextPage,
  };
}

/**
 * POST /review/{review_id}
 * Submit a review for a transaction (approve/reject).
 * Payload: { status: 'approved' | 'blocked' }
 */
export async function apiReviewTransaction(reviewId: number, status: 'approved' | 'blocked'): Promise<void> {
  await fetchHelper<void>(`/review/${reviewId}`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  }, true);
}

export async function apiGetDashboardStats(): Promise<DashboardStats> {
  return await fetchHelper<DashboardStats>(`/stats/dashboard/`, {
    method: 'GET',
  }, true);
}