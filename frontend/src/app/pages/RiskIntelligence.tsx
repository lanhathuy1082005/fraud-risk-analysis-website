import { LineChart, Line, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { generateTimeSeriesData, generateScatterData } from '../data/mockData';
import { TrendingUp, Activity, AlertTriangle } from 'lucide-react';

export default function RiskIntelligence() {
  const timeSeriesData = generateTimeSeriesData();
  const scatterData = generateScatterData();

  // Calculate some quick stats
  const avgRisk = Math.round(timeSeriesData.reduce((sum, d) => sum + d.avgRisk, 0) / timeSeriesData.length);
  const avgConfidence = Math.round(timeSeriesData.reduce((sum, d) => sum + d.avgConfidence, 0) / timeSeriesData.length);
  const lowConfidenceCount = scatterData.filter(d => d.confidence < 50).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Risk Intelligence Overview</h1>
        <p className="text-sm text-gray-600 mt-1">
          Analytical insights for risk patterns, model confidence, and decision support
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <h3 className="text-sm text-gray-600">24h Avg Risk Score</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{avgRisk}%</p>
          <p className="text-xs text-gray-500 mt-1">Trending across all transactions</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm text-gray-600">24h Avg Confidence</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{avgConfidence}%</p>
          <p className="text-xs text-gray-500 mt-1">Model certainty level</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="text-sm text-gray-600">Low Confidence Alerts</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{lowConfidenceCount}</p>
          <p className="text-xs text-gray-500 mt-1">Requires manual review</p>
        </div>
      </div>

      {/* Charts Row 1: Risk Over Time + Confidence Over Time */}
      <div className="grid grid-cols-2 gap-6">
        {/* Risk Over Time */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Over Time</h2>
          <p className="text-sm text-gray-600 mb-4">
            Track fraud risk trends to detect spikes and systematic changes
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                label={{ value: 'Risk Score (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <ReferenceLine key="high-risk" y={70} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'High Risk', position: 'right', fontSize: 10 }} />
              <ReferenceLine key="medium-risk" y={40} stroke="#eab308" strokeDasharray="3 3" label={{ value: 'Medium Risk', position: 'right', fontSize: 10 }} />
              <Line 
                type="monotone" 
                dataKey="avgRisk" 
                stroke="#dc2626" 
                strokeWidth={2}
                dot={{ fill: '#dc2626', r: 3 }}
                name="Average Risk"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Confidence Over Time */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Confidence Over Time</h2>
          <p className="text-sm text-gray-600 mb-4">
            Feature-level contributions to overall model confidence
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="ipGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.7}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.4}/>
                </linearGradient>
                <linearGradient id="geoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.7}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                </linearGradient>
                <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.7}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.4}/>
                </linearGradient>
                <linearGradient id="deviceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.7}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.4}/>
                </linearGradient>
                <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                label={{ value: 'Confidence Level (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => `${value}%`}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px' }}
                iconType="rect"
              />
              <ReferenceLine 
                key="low-confidence"
                y={50} 
                stroke="#ef4444" 
                strokeDasharray="3 3" 
                label={{ value: 'Low Confidence Zone', position: 'right', fontSize: 10 }}
              />
              <Area 
                type="monotone" 
                dataKey="ipConfidence" 
                stackId="1"
                stroke="#3b82f6" 
                strokeWidth={0.5}
                fill="url(#ipGradient)"
                name="IP Anomaly"
              />
              <Area 
                type="monotone" 
                dataKey="geoConfidence" 
                stackId="1"
                stroke="#8b5cf6" 
                strokeWidth={0.5}
                fill="url(#geoGradient)"
                name="Geo Anomaly"
              />
              <Area 
                type="monotone" 
                dataKey="velocityConfidence" 
                stackId="1"
                stroke="#06b6d4" 
                strokeWidth={0.5}
                fill="url(#velocityGradient)"
                name="Transaction Velocity"
              />
              <Area 
                type="monotone" 
                dataKey="deviceConfidence" 
                stackId="1"
                stroke="#10b981" 
                strokeWidth={0.5}
                fill="url(#deviceGradient)"
                name="Device Mismatch"
              />
              <Area 
                type="monotone" 
                dataKey="amountConfidence" 
                stackId="1"
                stroke="#f59e0b" 
                strokeWidth={0.5}
                fill="url(#amountGradient)"
                name="Amount Deviation"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart Row 2: Joint Risk Scatter (Full Width) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Joint Risk × Confidence Analysis
        </h2>
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

        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              type="number" 
              dataKey="risk" 
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              label={{ value: 'Risk Score (%)', position: 'insideBottom', offset: -10, style: { fontSize: 12 } }}
            />
            <YAxis 
              type="number" 
              dataKey="confidence" 
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
                      <p className="text-xs font-medium text-gray-900">{data.id}</p>
                      <p className="text-xs text-gray-600">Risk: {data.risk}%</p>
                      <p className="text-xs text-gray-600">Confidence: {data.confidence}%</p>
                      <p className="text-xs text-gray-600">Amount: ${data.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Status: {data.status}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Quadrant Reference Lines */}
            <ReferenceLine key="x-40" x={40} stroke="#9ca3af" strokeDasharray="3 3" />
            <ReferenceLine key="x-70" x={70} stroke="#9ca3af" strokeDasharray="3 3" />
            <ReferenceLine key="y-50" y={50} stroke="#9ca3af" strokeDasharray="3 3" />
            <ReferenceLine key="y-70" y={70} stroke="#9ca3af" strokeDasharray="3 3" />
            
            <Scatter name="Transactions" data={scatterData}>
              {scatterData.map((entry, index) => {
                let color = '#6b7280'; // default gray
                
                // Determine color based on quadrant
                if (entry.risk >= 70 && entry.confidence >= 70) {
                  color = '#dc2626'; // red - auto escalate
                } else if (entry.risk >= 70 && entry.confidence < 70) {
                  color = '#f97316'; // orange - manual review
                } else if (entry.risk < 40 && entry.confidence >= 70) {
                  color = '#16a34a'; // green - safe
                } else if (entry.risk < 40 && entry.confidence < 70) {
                  color = '#9ca3af'; // gray - monitor
                } else {
                  color = '#eab308'; // yellow - medium
                }
                
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={color}
                    fillOpacity={0.7}
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Insights Panel */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-base font-semibold text-blue-900 mb-3">Key Insights</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              <strong>{scatterData.filter(d => d.risk >= 70 && d.confidence >= 70).length} transactions</strong> in the auto-escalate quadrant require immediate senior analyst review.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              <strong>{lowConfidenceCount} transactions</strong> show model uncertainty - consider gathering additional contextual data.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              Average confidence at <strong>{avgConfidence}%</strong> indicates {avgConfidence >= 70 ? 'stable model performance' : 'potential adversarial pressure or data drift'}.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
