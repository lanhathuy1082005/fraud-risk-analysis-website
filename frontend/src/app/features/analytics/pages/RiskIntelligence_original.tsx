import { useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, Cell,
} from 'recharts';
import { generateTimeSeriesData, generateScatterData } from '../data/mockData';
import { TrendingUp, Activity, AlertTriangle, FlaskConical, ChevronRight, X } from 'lucide-react';
import { useTransactionAnalysis } from '../context/TransactionAnalysisContext';
import { useNavigate } from 'react-router';

export default function RiskIntelligence() {
  const navigate = useNavigate();
  const { analysisData, clearAnalysisData } = useTransactionAnalysis();
  const { transaction1, transaction2 } = analysisData;

  const timeSeriesData = useMemo(() => generateTimeSeriesData(), []);
  const scatterData = useMemo(() => generateScatterData(), []);

  const avgRisk = Math.round(timeSeriesData.reduce((sum, d) => sum + d.avgRisk, 0) / timeSeriesData.length);
  const avgConfidence = Math.round(timeSeriesData.reduce((sum, d) => sum + d.avgConfidence, 0) / timeSeriesData.length);
  const lowConfidenceCount = scatterData.filter(d => d.confidence < 50).length;

  // Find representative time indices for submitted transactions
  const findTimeIndex = (timeStr: string): number => {
    // Convert "HH:MM" 24h to "HH:MM AM/PM" 12h for matching chart labels
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    const target = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    const exact = timeSeriesData.findIndex(d => d.time === target);
    if (exact !== -1) return exact;
    // Return a representative midpoint index if no exact match
    return Math.floor(timeSeriesData.length * (h / 24));
  };

  const idx1 = transaction1 ? findTimeIndex(transaction1.time) : -1;
  const idx2 = transaction2 ? findTimeIndex(transaction2.time) : -1;

  const hasSubmitted = !!(transaction1 || transaction2);

  // Build enriched scatter data for coloring
  const enrichedScatter = useMemo(() => {
    return scatterData.map(d => {
      let color = '#6b7280';
      if (d.risk >= 70 && d.confidence >= 70) color = '#dc2626';
      else if (d.risk >= 70 && d.confidence < 70) color = '#f97316';
      else if (d.risk < 40 && d.confidence >= 70) color = '#16a34a';
      else if (d.risk < 40 && d.confidence < 70) color = '#9ca3af';
      else color = '#eab308';
      return { ...d, color };
    });
  }, [scatterData]);

  const submittedScatterPoints = useMemo(() => {
    const pts = [];
    if (transaction1) pts.push({
      risk: transaction1.risk,
      confidence: transaction1.confidence,
      amount: transaction1.amount,
      id: transaction1.customerId || 'Txn 1',
      label: transaction1.label,
      status: 'Simulated',
      color: '#ef4444',
      isSubmitted: true,
    });
    if (transaction2) pts.push({
      risk: transaction2.risk,
      confidence: transaction2.confidence,
      amount: transaction2.amount,
      id: transaction2.customerId || 'Txn 2',
      label: transaction2.label,
      status: 'Simulated',
      color: '#3b82f6',
      isSubmitted: true,
    });
    return pts;
  }, [transaction1, transaction2]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Risk Intelligence Overview</h1>
          <p className="text-sm text-gray-600 mt-1">
            Analytical insights for risk patterns, model confidence, and decision support
          </p>
        </div>
        {hasSubmitted && (
          <button
            onClick={() => navigate('/transaction-analysis')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <FlaskConical className="w-4 h-4" />
            Back to Analysis
          </button>
        )}
      </div>

      {/* Submitted transactions active banner */}
      {hasSubmitted && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <FlaskConical className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">Simulated Transactions Active</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Highlighted markers on all charts below show your submitted transactions.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {transaction1 && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-white">{transaction1.label}</p>
                    <p className="text-xs text-slate-400">
                      Risk{' '}
                      <span className={transaction1.risk >= 70 ? 'text-red-400' : transaction1.risk >= 40 ? 'text-yellow-400' : 'text-green-400'}>
                        {transaction1.risk}%
                      </span>
                      {' · '}Conf <span className="text-blue-400">{transaction1.confidence}%</span>
                    </p>
                  </div>
                </div>
              )}
              {transaction2 && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-white">{transaction2.label}</p>
                    <p className="text-xs text-slate-400">
                      Risk{' '}
                      <span className={transaction2.risk >= 70 ? 'text-red-400' : transaction2.risk >= 40 ? 'text-yellow-400' : 'text-green-400'}>
                        {transaction2.risk}%
                      </span>
                      {' · '}Conf <span className="text-blue-400">{transaction2.confidence}%</span>
                    </p>
                  </div>
                </div>
              )}
              <button
                onClick={clearAnalysisData}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Chart 1: Risk Over Time */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-lg font-semibold text-gray-900">Risk Over Time</h2>
            {hasSubmitted && (
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {transaction1 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />T1
                  </span>
                )}
                {transaction2 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />T2
                  </span>
                )}
              </div>
            )}
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

              {/* Submitted transaction time markers */}
              {transaction1 && idx1 >= 0 && timeSeriesData[idx1] && (
                <ReferenceLine
                  x={timeSeriesData[idx1].time}
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  label={{ value: '▼T1', position: 'insideTopLeft', fontSize: 10, fill: '#ef4444' }}
                />
              )}
              {transaction2 && idx2 >= 0 && timeSeriesData[idx2] && (
                <ReferenceLine
                  x={timeSeriesData[idx2].time}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  label={{ value: '▼T2', position: 'insideTopRight', fontSize: 10, fill: '#3b82f6' }}
                />
              )}

              <Line
                type="monotone"
                dataKey="avgRisk"
                stroke="#dc2626"
                strokeWidth={2}
                dot={(dotProps: { cx?: number; cy?: number; index?: number }) => {
                  const { cx, cy, index } = dotProps;
                  if (cx == null || cy == null || index == null) return <g key={`dot-${index ?? 0}`} />;
                  const isT1 = transaction1 && idx1 === index;
                  const isT2 = transaction2 && idx2 === index;
                  if (isT1 || isT2) {
                    const color = isT1 ? '#ef4444' : '#3b82f6';
                    return (
                      <g key={`dot-${index}`}>
                        <circle cx={cx} cy={cy} r={12} fill={color} fillOpacity={0.15} />
                        <circle cx={cx} cy={cy} r={7} fill={color} stroke="white" strokeWidth={2} />
                      </g>
                    );
                  }
                  return <circle key={`dot-${index}`} cx={cx} cy={cy} r={3} fill="#dc2626" />;
                }}
                name="Average Risk"
              />
            </LineChart>
          </ResponsiveContainer>

          {hasSubmitted && (
            <div className="mt-3 flex flex-wrap gap-2">
              {transaction1 && idx1 >= 0 && timeSeriesData[idx1] && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs text-red-700 font-medium">
                    Txn 1 @ {timeSeriesData[idx1].time} · Risk {transaction1.risk}%
                  </span>
                </div>
              )}
              {transaction2 && idx2 >= 0 && timeSeriesData[idx2] && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs text-blue-700 font-medium">
                    Txn 2 @ {timeSeriesData[idx2].time} · Risk {transaction2.risk}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chart 2: Confidence Over Time */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-lg font-semibold text-gray-900">Confidence Over Time</h2>
            {hasSubmitted && (
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {transaction1 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />T1
                  </span>
                )}
                {transaction2 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />T2
                  </span>
                )}
              </div>
            )}
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
                <linearGradient id="geoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="deviceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#6b7280" interval={4} />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                label={{ value: 'Confidence Level (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value: number) => `${value}%`}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} iconType="rect" />
              <ReferenceLine
                y={50}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{ value: 'Low Confidence Zone', position: 'right', fontSize: 10 }}
              />

              {transaction1 && idx1 >= 0 && timeSeriesData[idx1] && (
                <ReferenceLine
                  x={timeSeriesData[idx1].time}
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  label={{ value: '▼T1', position: 'insideTopLeft', fontSize: 10, fill: '#ef4444' }}
                />
              )}
              {transaction2 && idx2 >= 0 && timeSeriesData[idx2] && (
                <ReferenceLine
                  x={timeSeriesData[idx2].time}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  label={{ value: '▼T2', position: 'insideTopRight', fontSize: 10, fill: '#3b82f6' }}
                />
              )}

              <Area type="monotone" dataKey="ipConfidence" stackId="1" stroke="#3b82f6" strokeWidth={0.5} fill="url(#ipGradient)" name="IP Anomaly" />
              <Area type="monotone" dataKey="geoConfidence" stackId="1" stroke="#8b5cf6" strokeWidth={0.5} fill="url(#geoGradient)" name="Geo Anomaly" />
              <Area type="monotone" dataKey="velocityConfidence" stackId="1" stroke="#06b6d4" strokeWidth={0.5} fill="url(#velocityGradient)" name="Transaction Velocity" />
              <Area type="monotone" dataKey="deviceConfidence" stackId="1" stroke="#10b981" strokeWidth={0.5} fill="url(#deviceGradient)" name="Device Mismatch" />
              <Area type="monotone" dataKey="amountConfidence" stackId="1" stroke="#f59e0b" strokeWidth={0.5} fill="url(#amountGradient)" name="Amount Deviation" />
            </AreaChart>
          </ResponsiveContainer>

          {hasSubmitted && (
            <div className="mt-3 flex flex-wrap gap-2">
              {transaction1 && idx1 >= 0 && timeSeriesData[idx1] && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs text-red-700 font-medium">
                    Txn 1 @ {timeSeriesData[idx1].time} · Conf {transaction1.confidence}%
                  </span>
                </div>
              )}
              {transaction2 && idx2 >= 0 && timeSeriesData[idx2] && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs text-blue-700 font-medium">
                    Txn 2 @ {timeSeriesData[idx2].time} · Conf {transaction2.confidence}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chart 3: Joint Risk Scatter (Full Width) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-lg font-semibold text-gray-900">
            Joint Risk × Confidence Analysis
          </h2>
          {hasSubmitted && (
            <div className="flex items-center gap-3">
              {transaction1 && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-700">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Txn 1 · Risk {transaction1.risk}%
                </div>
              )}
              {transaction2 && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs font-medium text-blue-700">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Txn 2 · Risk {transaction2.risk}%
                </div>
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Decision support quadrants: separate fraud likelihood from model certainty
          {hasSubmitted && (
            <span className="ml-2 text-indigo-600 font-medium">
              · Submitted transactions shown as large highlighted markers
            </span>
          )}
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
                      {data.isSubmitted && (
                        <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-100">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: data.color }}
                          />
                          <p className="text-xs font-semibold text-gray-900">{data.label}</p>
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Simulated</span>
                        </div>
                      )}
                      <p className="text-xs font-medium text-gray-900">{data.id}</p>
                      <p className="text-xs text-gray-600">Risk: {data.risk}%</p>
                      <p className="text-xs text-gray-600">Confidence: {data.confidence}%</p>
                      <p className="text-xs text-gray-600">Amount: ${(data.amount || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Status: {data.status}</p>
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

            {/* Background transactions */}
            <Scatter
              name="Transactions"
              data={enrichedScatter}
              shape={(props: { cx?: number; cy?: number; payload?: { color?: string } }) => {
                const { cx, cy, payload } = props;
                if (cx == null || cy == null) return <g />;
                return <circle cx={cx} cy={cy} r={5} fill={payload?.color || '#6b7280'} fillOpacity={0.7} />;
              }}
            >
              {enrichedScatter.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.7} />
              ))}
            </Scatter>

            {/* Submitted transactions — distinct highlighted markers */}
            {submittedScatterPoints.length > 0 && (
              <Scatter
                name="Submitted"
                data={submittedScatterPoints}
                shape={(props: { cx?: number; cy?: number; payload?: { color?: string } }) => {
                  const { cx, cy, payload } = props;
                  if (cx == null || cy == null) return <g />;
                  const color = payload?.color || '#ef4444';
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r={24} fill={color} fillOpacity={0.07} />
                      <circle cx={cx} cy={cy} r={16} fill={color} fillOpacity={0.13} />
                      <line x1={cx - 22} y1={cy} x2={cx + 22} y2={cy} stroke={color} strokeWidth={1.2} strokeOpacity={0.4} />
                      <line x1={cx} y1={cy - 22} x2={cx} y2={cy + 22} stroke={color} strokeWidth={1.2} strokeOpacity={0.4} />
                      <circle cx={cx} cy={cy} r={9} fill={color} stroke="white" strokeWidth={2.5} />
                    </g>
                  );
                }}
              />
            )}
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
              <strong>{lowConfidenceCount} transactions</strong> show model uncertainty — consider gathering additional contextual data.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              Average confidence at <strong>{avgConfidence}%</strong> indicates{' '}
              {avgConfidence >= 70 ? 'stable model performance' : 'potential adversarial pressure or data drift'}.
            </span>
          </li>

          {transaction1 && (
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">◆</span>
              <span>
                <strong className="text-red-700">Simulated Txn 1 ({transaction1.model}):</strong> Risk {transaction1.risk}% · Confidence {transaction1.confidence}% ·{' '}
                {transaction1.risk >= 70 && transaction1.confidence >= 70 && 'Falls in auto-escalate quadrant — immediate review recommended.'}
                {transaction1.risk >= 70 && transaction1.confidence < 70 && 'High risk with uncertain model — manual investigation required.'}
                {transaction1.risk < 40 && transaction1.confidence >= 70 && 'Low risk, high confidence — transaction appears safe to approve.'}
                {transaction1.risk < 40 && transaction1.confidence < 70 && 'Low risk but uncertain model — continue monitoring.'}
                {transaction1.risk >= 40 && transaction1.risk < 70 && 'Medium risk zone — flag for analyst review.'}
              </span>
            </li>
          )}

          {transaction2 && (
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">◆</span>
              <span>
                <strong className="text-blue-700">Simulated Txn 2 ({transaction2.model}):</strong> Risk {transaction2.risk}% · Confidence {transaction2.confidence}% ·{' '}
                {transaction2.risk >= 70 && transaction2.confidence >= 70 && 'Falls in auto-escalate quadrant — immediate review recommended.'}
                {transaction2.risk >= 70 && transaction2.confidence < 70 && 'High risk with uncertain model — manual investigation required.'}
                {transaction2.risk < 40 && transaction2.confidence >= 70 && 'Low risk, high confidence — transaction appears safe to approve.'}
                {transaction2.risk < 40 && transaction2.confidence < 70 && 'Low risk but uncertain model — continue monitoring.'}
                {transaction2.risk >= 40 && transaction2.risk < 70 && 'Medium risk zone — flag for analyst review.'}
              </span>
            </li>
          )}
        </ul>

        {!hasSubmitted && (
          <div className="mt-4 pt-4 border-t border-blue-200 flex items-center justify-between">
            <p className="text-sm text-blue-700">
              Want to simulate transactions and see them highlighted on these charts?
            </p>
            <button
              onClick={() => navigate('/transaction-analysis')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Open Transaction Analysis
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
