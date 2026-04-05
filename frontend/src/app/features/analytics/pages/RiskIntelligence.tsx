import { useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, Cell,
} from 'recharts';
import { TrendingUp, Activity} from 'lucide-react';

export default function RiskIntelligence() {

  const timeSeriesData = useMemo(() => {
    // Placeholder: generate simple time series data
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      avgRisk: Math.floor(Math.random() * 100),
    }));
  }, []);

  const avgRisk = timeSeriesData.reduce((sum, d) => sum + d.avgRisk, 0) / timeSeriesData.length;
  const avgConfidence = Math.floor(Math.random() * 100);

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

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <h3 className="text-sm text-gray-600">24h Avg Risk Score</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{avgRisk.toFixed(1)}%</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm text-gray-600">24h Avg Confidence</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{avgConfidence}%</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Chart 1: Risk Over Time */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-lg font-semibold text-gray-900">Risk Over Time</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Track fraud risk trends to detect spikes and systematic changes
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#6b7280" interval={4} />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                label={{ value: 'Risk Score (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
              />
              <ReferenceLine y={70} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'High Risk', position: 'right', fontSize: 10 }} />
              <ReferenceLine y={40} stroke="#eab308" strokeDasharray="3 3" label={{ value: 'Medium Risk', position: 'right', fontSize: 10 }} />

              <Line
                type="monotone"
                dataKey="avgRisk"
                stroke="#dc2626"
                strokeWidth={2}
                dot={false}
                name="Average Risk"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Confidence Over Time */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-lg font-semibold text-gray-900">Confidence Over Time</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Feature-level contributions to overall model confidence
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="ipGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#6b7280" interval={4} />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                label={{ value: 'Confidence (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="avgRisk"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#ipGradient)"
                name="Confidence"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
