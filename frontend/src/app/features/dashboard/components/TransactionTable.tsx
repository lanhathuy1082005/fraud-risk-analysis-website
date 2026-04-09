import { TransactionPublic } from '../services/api';

interface TransactionTableProps {
  transactions: TransactionPublic[];
  onSelectTransaction: (transaction: TransactionPublic) => void;
}

export function TransactionTable({ transactions, onSelectTransaction }: TransactionTableProps) {
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-green-100 text-green-800';
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
                    transaction.risk_score * 100 >= 70 ? 'text-red-600' :
                    transaction.risk_score * 100 >= 40 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {transaction.risk_score * 100}%
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`text-sm ${
                    transaction.confidence_score * 100 >= 70 ? 'text-gray-900 font-medium' : 'text-gray-500'
                  }`}>
                    {transaction.confidence_score * 100}%
                  </span>
                </td>
                { transaction.transaction_status && (
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.transaction_status)}`}>
                    {transaction.transaction_status}
                  </span>
                </td>
                )
              }
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
