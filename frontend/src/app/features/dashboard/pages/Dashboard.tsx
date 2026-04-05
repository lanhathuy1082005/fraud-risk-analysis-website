import { useEffect, useState } from 'react';
import { TransactionPublic } from '../services/api';
import { KPICard } from '../components/KPICard';
import { TransactionTable } from '../components/TransactionTable';
import { TransactionDetailModal } from '../components/TransactionDetailModal';
import { apiGetDashboardStats, apiGetTransactions } from '../services/api';

// Placeholder mock data


export default function Dashboard() {
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionPublic | null>(null);
  const [transactions, setTransactions] = useState<TransactionPublic[]>([]);
  const [dashboardStats, setDashboardStats] = useState(
    {
    avgAmount: 0,
    transactionCount:0,
    highConfAndhighRisk:0
    }
  )


useEffect(() => {
  const fetchData = async () => {
    const [stats, txns] = await Promise.all([
      apiGetDashboardStats(),
      apiGetTransactions(),
    ]);

    setDashboardStats({
      avgAmount: stats.avg_amount_24h,
      transactionCount: stats.txn_count_24h,
      highConfAndhighRisk: stats.high_conf_high_risk_txn_count,
    });
    setTransactions(txns);
  };

  fetchData();
}, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Operational Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Real-time fraud detection and transaction monitoring</p>
        </div>
      </div>


      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
      <KPICard
          title="Average Transaction Amount Today"
          value={dashboardStats.avgAmount.toFixed(2)}
          subtitle="Last updated: now"
        />
        <KPICard
          title="Total Transactions Today"
          value={dashboardStats.transactionCount}
          subtitle="Last updated: now"
        />
        <KPICard
          title="High Risk + High Confidence"
          value={dashboardStats.highConfAndhighRisk}
          subtitle="Requires immediate action"
        />
      </div>

      {/* Transaction Table */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        <TransactionTable
          transactions={transactions}
          onSelectTransaction={setSelectedTransaction}
        />
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}
