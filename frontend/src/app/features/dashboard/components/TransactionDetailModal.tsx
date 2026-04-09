import { X, CheckCircle, Ban } from 'lucide-react';
import { TransactionPublic } from '../services/api';
import { apiReviewTransaction } from '../services/api';

interface TransactionDetailModalProps {
  transaction: TransactionPublic | null;
  onClose: () => void;
  fetchData: () => void;
}

export function TransactionDetailModal({
  transaction,
  onClose,
  fetchData,
}: TransactionDetailModalProps) {
  const onReview = async (status: 'approved' | 'blocked') => {
    await apiReviewTransaction({ transaction_id: transaction!.id, status: status });
  }
  if (!transaction) return null;

const formatCategory = (category: string) => category.startsWith('es_') ? category.slice(3) : category;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Transaction Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Transaction Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="text-sm text-gray-600">Customer ID</label>
              <p className="text-base font-medium text-gray-900 mt-1">{transaction.id}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Transaction ID</label>
              <p className="text-base font-medium text-gray-900 mt-1">{transaction.uuid}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Amount</label>
              <p className="text-base font-medium text-gray-900 mt-1">
                ${transaction.amount.toString()}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Timestamp</label>
              <p className="text-base font-medium text-gray-900 mt-1">
                {transaction.time.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Category</label>
              <p className="text-base font-medium text-gray-900 mt-1">{formatCategory(transaction.category)}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Device Type</label>
              <p className="text-base font-medium text-gray-900 mt-1">{transaction.device_type}</p>
            </div>
          </div>
            

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-200 bg-gray-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {!transaction.transaction_status && (
          <>
          <button
            onClick={async () => {
              await onReview('approved');
              await fetchData();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={async () => {
              await onReview('blocked');
              await fetchData();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Ban className="w-4 h-4" />
            Block
          </button>
          </>
        )}
        </div>
      </div>
    </div>
    </div>
  );
}
