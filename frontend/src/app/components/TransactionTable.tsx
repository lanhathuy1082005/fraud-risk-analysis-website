import { Transaction } from '../data/mockData';
import { CompositeRiskBar } from './CompositeRiskBar';

interface TransactionTableProps {
  transactions: Transaction[];
  onSelectTransaction: (transaction: Transaction) => void;
}

export function TransactionTable({ transactions, onSelectTransaction }: TransactionTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Escalated': return 'bg-red-100 text-red-800';
      case 'Reviewed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Risk Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Fraud Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                onClick={() => onSelectTransaction(transaction)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{transaction.id}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">${transaction.amount.toLocaleString()}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`text-sm font-semibold ${
                    transaction.riskScore >= 70 ? 'text-red-600' :
                    transaction.riskScore >= 40 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {transaction.riskScore}%
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`text-sm ${
                    transaction.confidenceLevel >= 70 ? 'text-gray-900 font-medium' : 'text-gray-500'
                  }`}>
                    {transaction.confidenceLevel}%
                  </span>
                </td>
                <td className="px-4 py-4" style={{ minWidth: '180px' }}>
                  <CompositeRiskBar 
                    riskScore={transaction.riskScore} 
                    confidenceLevel={transaction.confidenceLevel}
                    size="small"
                  />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
