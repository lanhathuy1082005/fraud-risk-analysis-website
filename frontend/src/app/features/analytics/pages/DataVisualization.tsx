import { useEffect, useState } from 'react';
import {
  LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { TrendingUp, Activity} from 'lucide-react';
import { apigetVisualizationStats, apiConfidenceOverRisk, apiConfidenceOverTime, apiRiskOverTime } from '../services/api';

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


  useEffect(() => {
    const fetchPageData = async () => {
      const [statsData, riskData, confidenceData, confidenceRiskData] = await Promise.all([
        apigetVisualizationStats(),
        apiRiskOverTime(),
        apiConfidenceOverTime(),
        apiConfidenceOverRisk()
      ]);

      setStats({
        avgRisk: statsData.avg_risk_score_24h,
        avgConfidence: statsData.avg_conf_score_24h
      });
      setRiskOverTime(riskData);
      setConfidenceOverTime(confidenceData);
      setConfidenceOverRisk(confidenceRiskData);
    };

    fetchPageData();
  }, []);

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
            <LineChart data={riskOverTime}>
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
            <AreaChart data={confidenceOverTime}>
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
            {/* Chart 3: Joint Risk Scatter (Full Width) */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Joint Risk × Confidence Analysis</h2>
            <p className="text-sm text-gray-600 mb-4">
              Decision support quadrants: separate fraud likelihood from model certainty
            </p>

            {/* Quadrant Legend */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs font-medium text-red-900">High Risk + High Confidence</p>
                <p className="text-xs text-red-700 mt-1">→ Auto escalate</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs font-medium text-orange-900">High Risk + Low Confidence</p>
                <p className="text-xs text-orange-700 mt-1">→ Manual review</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-medium text-green-900">Low Risk + High Confidence</p>
                <p className="text-xs text-green-700 mt-1">→ Safe</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-900">Low Risk + Low Confidence</p>
                <p className="text-xs text-gray-700 mt-1">→ Monitor</p>
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
                <Scatter name="Transactions" data={confidenceOverRisk} fill="#8b5cf6" opacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
