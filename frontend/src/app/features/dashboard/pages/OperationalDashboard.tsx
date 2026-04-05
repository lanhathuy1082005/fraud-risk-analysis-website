import { useState } from 'react';
import { KPICard } from '../components/KPICard';
import { TransactionTable } from '../../transactions/components/TransactionTable';
import { TransactionDetailModal } from '../../transactions/components/TransactionDetailModal';
import { TrendingUp, Activity, Target, AlertCircle } from 'lucide-react';

// Placeholder mock data
const mockTransactions: Transaction[] = [];

export default function OperationalDashboard() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [dashboardStats, setDashboardStats] = useState(
    {
    avgConfindenceScore: 0,
    avgRiskScore: 0,
    transactionCount:0,
    highConfAndhighRisk:0
    }
  )

  const handleApprove = (id: string) => {
    console.log('Approved:', id);
    // In production, this would update the transaction status
  };

  const handleBlock = (id: string) => {
    console.log('Blocked:', id);
    // In production, this would block the transaction
  };

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
          title="Total Transactions Today"
          value={dashboardStats.transactionCount}
          subtitle="Last updated: now"
        />
        <KPICard
          title="Average Risk Score"
          value={`${dashboardStats.avgRiskScore}%`}
          subtitle="0-100% scale"
        />
        <KPICard
          title="Average Confidence Score"
          value={`${dashboardStats.avgConfindenceScore}%`}
          subtitle="Model certainty"
        />
        <KPICard
          title="High Risk + High Confidence"
          value={dashboardStats.highConfAndhighRisk}
          subtitle="Requires immediate action"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <div>
            <p className="text-xs text-red-700 font-medium">Escalated</p>
            <p className="text-xl font-semibold text-red-900">
              {mockTransactions.filter(t => t.status === 'Escalated').length}
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <Activity className="w-8 h-8 text-yellow-600" />
          <div>
            <p className="text-xs text-yellow-700 font-medium">Pending Review</p>
            <p className="text-xl font-semibold text-yellow-900">
              {mockTransactions.filter(t => t.status === 'Pending').length}
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <Target className="w-8 h-8 text-green-600" />
          <div>
            <p className="text-xs text-green-700 font-medium">Reviewed</p>
            <p className="text-xl font-semibold text-green-900">
              {mockTransactions.filter(t => t.status === 'Reviewed').length}
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          <div>
            <p className="text-xs text-blue-700 font-medium">Low Confidence</p>
            <p className="text-xl font-semibold text-blue-900">
              {mockTransactions.filter(t => t.confidenceLevel < 50).length}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        <TransactionTable
          transactions={mockTransactions}
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
