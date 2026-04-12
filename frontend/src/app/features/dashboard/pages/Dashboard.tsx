import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const location = useLocation();
  const pageSize = 15;
  const [highlightedUuid, setHighlightedUuid] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = async () => {
    const [stats, pageData] = await Promise.all([
      apiGetDashboardStats(),
      apiGetTransactions(currentPage, pageSize),
    ]);

    setDashboardStats({
      avgAmount: stats.avg_amount_24h,
      transactionCount: stats.txn_count_24h,
      highConfAndhighRisk: stats.high_conf_high_risk_txn_count,
    });
    setTransactions(pageData.transactions);
    setHasNextPage(pageData.hasNextPage);
  };

  const loadPage = async (page: number) => {
    setCurrentPage(page);
    const [stats, pageData] = await Promise.all([
      apiGetDashboardStats(),
      apiGetTransactions(page, pageSize),
    ]);

    setDashboardStats({
      avgAmount: stats.avg_amount_24h,
      transactionCount: stats.txn_count_24h,
      highConfAndhighRisk: stats.high_conf_high_risk_txn_count,
    });
    setTransactions(pageData.transactions);
    setHasNextPage(pageData.hasNextPage);
  };

  useEffect(() => {
  if (location.state?.highlightNew) {
    const highlightFetch = async () => {
      setCurrentPage(1);
      const [stats, pageData] = await Promise.all([
        apiGetDashboardStats(),
        apiGetTransactions(1, pageSize),
      ]);
      setDashboardStats({
        avgAmount: stats.avg_amount_24h,
        transactionCount: stats.txn_count_24h,
        highConfAndhighRisk: stats.high_conf_high_risk_txn_count,
      });
      setTransactions(pageData.transactions);
      setHasNextPage(pageData.hasNextPage);
      if (pageData.transactions.length > 0) {
        const newestUuid = pageData.transactions[0].uuid;
        setHighlightedUuid(newestUuid);
        if (highlightTimer.current) clearTimeout(highlightTimer.current);
        highlightTimer.current = setTimeout(() => {
          setHighlightedUuid(null);
        }, 50000);
      }
    };
    highlightFetch();
  } else {
    fetchData();
  }
  return () => {
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
  };
  }, [location]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
          highlightedUuid={highlightedUuid}
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            Page {currentPage} · Showing {transactions.length} transaction(s)
          </p>
          <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white shadow-sm">
            <button
              onClick={() => loadPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              Previous
            </button>
            <button
              onClick={() => loadPage(currentPage + 1)}
              disabled={!hasNextPage}
              className="px-3 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        fetchData={fetchData}
      />
    </div>
  );
}
