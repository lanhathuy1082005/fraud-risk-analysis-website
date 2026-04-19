import { useEffect, useState, useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { TrendingUp, Activity} from 'lucide-react';
import { apigetVisualizationStats, apiConfidenceOverRisk, apiConfidenceOverTime, apiRiskOverTime, apiGetAllTransactionsForFilter } from '../services/api';
import type { TransactionPublic } from "../../dashboard/services/api";

export default function DataVisualization() {
  const [stats, setStats] = useState<{ avgRisk: number, avgConfidence: number }>(
 { 
    avgRisk: 0, 
    avgConfidence: 0 
  }
);
  const [riskOverTime, setRiskOverTime] = useState<{ x: any, y: any }[]>([]);
  const [confidenceOverTime, setConfidenceOverTime] = useState<{ x: any, y: any }[]>([]);
  const [confidenceOverRisk, setConfidenceOverRisk] = useState<{ x: any, y: any }[]>([]);
  const formatDateTime = (val: string) => 
  new Date(val).toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
  ' ' + 
  new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const [allTransactions, setAllTransactions] = useState<TransactionPublic[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');

  const customerIds = useMemo(
    () => [...new Set(allTransactions.map((t) => String(t.customer_id)))].sort((a, b) => Number(a) - Number(b)),
    [allTransactions]
  );

  useEffect(() => {
    const fetchPageData = async () => {
      const [statsData, riskData, confidenceData, confidenceRiskData, txnData] = await Promise.all([
        apigetVisualizationStats(),
        apiRiskOverTime(),
        apiConfidenceOverTime(),
        apiConfidenceOverRisk(),
        apiGetAllTransactionsForFilter()
      ]);

      setStats({
        avgRisk: statsData.avg_risk_score_24h*100,
        avgConfidence: statsData.avg_conf_score_24h*100
      });
      setRiskOverTime(riskData.map((d: { x: string, y: number }) => ({ ...d, y: d.y * 100 })).reverse());
      setConfidenceOverTime(confidenceData.map((d: { x: string, y: number }) => ({ ...d, y: d.y * 100 })).reverse());
      setConfidenceOverRisk(confidenceRiskData.map((d: { x: any, y: any }) => ({ x: d.x * 100, y: d.y * 100 })));
      setAllTransactions(txnData);
    };

    fetchPageData();
  }, []);

// Derive filtered chart data from the selected customer's transactions
  const filteredRiskOverTime = useMemo(() => {
    if (!selectedCustomer) return riskOverTime;
    const times = new Set(
      allTransactions
        .filter((t) => String(t.customer_id) === selectedCustomer)
        .map((t) => t.time)
    );
    return riskOverTime.filter((d) => times.has(d.x));
  }, [selectedCustomer, riskOverTime, allTransactions]);

  const filteredConfidenceOverTime = useMemo(() => {
    if (!selectedCustomer) return confidenceOverTime;
    const customerTxns = allTransactions.filter(
      (t) => String(t.customer_id) === selectedCustomer
    );
    return customerTxns.map((t) => ({
      x: t.time,
      y: t.confidence_score * 100,
    }));
  }, [selectedCustomer, confidenceOverTime, allTransactions]);

  const filteredConfidenceOverRisk = useMemo(() => {
    if (!selectedCustomer) return confidenceOverRisk;
    const customerTxns = allTransactions.filter(
      (t) => String(t.customer_id) === selectedCustomer
    );
    return customerTxns.map((t) => ({
      x: t.risk_score * 100,
      y: t.confidence_score * 100,
    }));
  }, [selectedCustomer, confidenceOverRisk, allTransactions]);

  const hasData =
    !selectedCustomer ||
    filteredRiskOverTime.length > 0 ||
    filteredConfidenceOverTime.length > 0 ||
    filteredConfidenceOverRisk.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Risk Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">
            Analytics and visualization of model predictions: risk scores and confidence levels
          </p>
        </div>
      </div>

      {/* Customer Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="customer" className="text-xs font-medium text-gray-700">
          Select Customer
        </label>
        <select
          id="customer-filter"
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          className="flex-1 min-w-[180px] max-w-xs border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Customers</option>
          {customerIds.map((id) => (
            <option key={id} value={id}>
              Customer {id}
            </option>
          ))}
        </select>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <h3 className="text-sm text-gray-600">24h Avg Risk Score</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{stats.avgRisk.toFixed(1)}%</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm text-gray-600">24h Avg Confidence</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{stats.avgConfidence}%</p>
        </div>
      </div>

      {/* Empty state when customer has no data */}
      {selectedCustomer && !hasData && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-sm text-yellow-700">No data available for the selected customer.</p>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Risk Over Time */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-lg font-semibold text-gray-900">Risk Over Time</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Track fraud risk trends to detect spikes and systematic changes
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredRiskOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="x" 
                tickFormatter={formatDateTime}
                tick={selectedCustomer ? { fontSize: 11 } : false} 
                stroke="#6b7280" 
                interval={4}
                hide={!selectedCustomer} />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                label={{ value: 'Risk Score (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                labelFormatter={formatDateTime}
              />
              <ReferenceLine y={70} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'High Risk', position: 'right', fontSize: 10 }} />
              <ReferenceLine y={40} stroke="#eab308" strokeDasharray="3 3" label={{ value: 'Medium Risk', position: 'right', fontSize: 10 }} />

              <Line
                type="monotone"
                dataKey="y"
                stroke="#dc2626"
                strokeWidth={2}
                dot={false}
                name="Average Risk"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Confidence Over Time */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-lg font-semibold text-gray-900">Confidence Over Time</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Feature-level contributions to overall model confidence
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={filteredConfidenceOverTime}>
              <defs>
                <linearGradient id="ipGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="x" 
                tickFormatter={formatDateTime}
                tick={selectedCustomer ? { fontSize: 11 } : false}
                stroke="#6b7280" 
                interval={4}
                hide={!selectedCustomer} />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                label={{ value: 'Confidence (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                labelFormatter={formatDateTime}
              />
              <Area
                type="monotone"
                dataKey="y"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#ipGradient)"
                name="Confidence"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
            {/* Chart 3: Joint Risk Scatter (Full Width) */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Joint Risk × Confidence Analysis</h2>
            <p className="text-sm text-gray-600 mb-4">
              Decision support quadrants: separate fraud likelihood from model certainty
            </p>

            {/* Quadrant Legend */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs font-medium text-red-900">High Risk + High Confidence</p>
                <p className="text-xs text-red-700 mt-1">→ Auto escalate</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs font-medium text-orange-900">High Risk + Low Confidence</p>
                <p className="text-xs text-orange-700 mt-1">→ Manual review</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs font-medium text-orange-900">Low Risk + High Confidence</p>
                <p className="text-xs text-orange-700 mt-1">→ Manual review</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-medium text-green-900">Low Risk + Low Confidence</p>
                <p className="text-xs text-green-700 mt-1">→ Safe</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={420}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  label={{ value: 'Risk Score (%)', position: 'insideBottom', offset: -10, style: { fontSize: 12 } }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  label={{ value: 'Confidence Level (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                          <p className="text-xs text-gray-600">Risk: {data.x}%</p>
                          <p className="text-xs text-gray-600">Confidence: {data.y}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine x={40} stroke="#9ca3af" strokeDasharray="3 3" />
                <ReferenceLine x={70} stroke="#9ca3af" strokeDasharray="3 3" />
                <ReferenceLine y={50} stroke="#9ca3af" strokeDasharray="3 3" />
                <ReferenceLine y={70} stroke="#9ca3af" strokeDasharray="3 3" />
                <Scatter name="Transactions" data={filteredConfidenceOverRisk} fill="#8b5cf6" opacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
