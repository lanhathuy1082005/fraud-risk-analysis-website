import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  FlaskConical,
  ArrowRight,
  Cpu,
  User,
  DollarSign,
  Store,
  Clock,
  Users,
  Tag,
  Monitor,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useTransactionAnalysis } from '../context/TransactionAnalysisContext';

interface TransactionFormData {
  customerId: string;
  amount: string;
  merchantId: string;
  transactionTime: string;
  gender: string;
  ageGroup: string;
  category: string;
  deviceType: string;
  model: 'Model A' | 'Model B';
}

const emptyForm = (): TransactionFormData => ({
  customerId: '',
  amount: '',
  merchantId: '',
  transactionTime: '',
  gender: '',
  ageGroup: '',
  category: '',
  deviceType: '',
  model: 'Model A',
});

// Deterministic but realistic scoring based on form inputs
function computeScore(form: TransactionFormData): { risk: number; confidence: number } {
  let risk = 0;
  let confidence = 70;

  const amount = parseFloat(form.amount) || 0;
  if (amount > 10000) risk += 35;
  else if (amount > 5000) risk += 22;
  else if (amount > 1000) risk += 10;
  else risk += 2;

  if (form.category === 'Crypto') risk += 28;
  else if (form.category === 'Electronics') risk += 18;
  else if (form.category === 'Travel') risk += 12;
  else if (form.category === 'Groceries') risk += 2;
  else if (form.category === 'Food & Dining') risk += 3;

  if (form.deviceType === 'Unknown') { risk += 22; confidence -= 18; }
  else if (form.deviceType === 'Desktop') { risk += 5; confidence += 5; }
  else if (form.deviceType === 'Mobile') { risk += 3; confidence += 8; }
  else if (form.deviceType === 'Tablet') { risk += 4; confidence += 4; }

  if (form.ageGroup === '18-24') risk += 8;
  else if (form.ageGroup === '65+') risk += 12;
  else risk += 2;

  // Model B has slightly more variance
  if (form.model === 'Model B') {
    risk = Math.max(0, risk - 5 + Math.floor((risk * 0.1)));
    confidence = Math.max(20, confidence + 5);
  }

  const hour = parseInt((form.transactionTime || '12:00').split(':')[0]);
  if (hour >= 1 && hour <= 5) { risk += 15; confidence -= 10; }

  risk = Math.min(98, Math.max(2, risk));
  confidence = Math.min(97, Math.max(22, confidence));

  return { risk, confidence };
}

function getRecommendedAction(risk: number, confidence: number): { label: string; color: string; icon: React.ReactNode; bg: string; border: string } {
  if (risk >= 70 && confidence >= 70) return {
    label: 'Auto Escalate',
    color: 'text-red-700',
    icon: <AlertTriangle className="w-4 h-4" />,
    bg: 'bg-red-50',
    border: 'border-red-200',
  };
  if (risk >= 70 && confidence < 70) return {
    label: 'Manual Review',
    color: 'text-orange-700',
    icon: <Info className="w-4 h-4" />,
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  };
  if (risk < 40 && confidence >= 70) return {
    label: 'Approve — Safe',
    color: 'text-green-700',
    icon: <CheckCircle2 className="w-4 h-4" />,
    bg: 'bg-green-50',
    border: 'border-green-200',
  };
  return {
    label: 'Monitor',
    color: 'text-gray-700',
    icon: <Info className="w-4 h-4" />,
    bg: 'bg-gray-50',
    border: 'border-gray-200',
  };
}

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const AGE_GROUPS = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
const CATEGORIES = ['Groceries', 'Food & Dining', 'Electronics', 'Travel', 'Crypto', 'Healthcare', 'Entertainment', 'Retail'];
const DEVICE_TYPES = ['Mobile', 'Desktop', 'Tablet', 'Unknown'];
const MODELS = ['Model A', 'Model B'] as const;

function FormField({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
        <span className="text-gray-400">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

function inputCls() {
  return 'w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
}

function selectCls() {
  return 'w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none';
}

interface FormPanelProps {
  index: 1 | 2;
  form: TransactionFormData;
  onChange: (field: keyof TransactionFormData, value: string) => void;
  result: { risk: number; confidence: number } | null;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
}

function FormPanel({ index, form, onChange, result, accentColor, accentBg, accentBorder, accentText }: FormPanelProps) {
  const action = result ? getRecommendedAction(result.risk, result.confidence) : null;

  return (
    <div className={`bg-white border-2 ${accentBorder} rounded-xl overflow-hidden flex flex-col`}>
      {/* Header */}
      <div className={`${accentBg} border-b ${accentBorder} px-5 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`${accentColor} p-1.5 rounded-lg`}>
              <FlaskConical className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Transaction {index}</h3>
              <p className={`text-xs ${accentText}`}>
                {index === 1 ? 'Primary analysis' : 'Comparison analysis'}
              </p>
            </div>
          </div>
          {/* Model selector */}
          <div className="flex gap-1 p-1 bg-white border border-gray-200 rounded-lg">
            {MODELS.map(m => (
              <button
                key={m}
                onClick={() => onChange('model', m)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  form.model === m
                    ? `${accentColor} text-white shadow-sm`
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form fields */}
      <div className="p-5 flex-1 grid grid-cols-2 gap-4 content-start">
        <FormField label="Customer ID" icon={<User className="w-3.5 h-3.5" />}>
          <input
            type="text"
            placeholder="e.g. CUST-10042"
            value={form.customerId}
            onChange={e => onChange('customerId', e.target.value)}
            className={inputCls()}
          />
        </FormField>

        <FormField label="Amount (USD)" icon={<DollarSign className="w-3.5 h-3.5" />}>
          <input
            type="number"
            placeholder="e.g. 2500"
            value={form.amount}
            onChange={e => onChange('amount', e.target.value)}
            className={inputCls()}
          />
        </FormField>

        <FormField label="Merchant ID" icon={<Store className="w-3.5 h-3.5" />}>
          <input
            type="text"
            placeholder="e.g. MERCH-5021"
            value={form.merchantId}
            onChange={e => onChange('merchantId', e.target.value)}
            className={inputCls()}
          />
        </FormField>

        <FormField label="Transaction Time" icon={<Clock className="w-3.5 h-3.5" />}>
          <input
            type="time"
            value={form.transactionTime}
            onChange={e => onChange('transactionTime', e.target.value)}
            className={inputCls()}
          />
        </FormField>

        <FormField label="Gender" icon={<Users className="w-3.5 h-3.5" />}>
          <select value={form.gender} onChange={e => onChange('gender', e.target.value)} className={selectCls()}>
            <option value="">Select...</option>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </FormField>

        <FormField label="Age Group" icon={<User className="w-3.5 h-3.5" />}>
          <select value={form.ageGroup} onChange={e => onChange('ageGroup', e.target.value)} className={selectCls()}>
            <option value="">Select...</option>
            {AGE_GROUPS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </FormField>

        <FormField label="Category" icon={<Tag className="w-3.5 h-3.5" />}>
          <select value={form.category} onChange={e => onChange('category', e.target.value)} className={selectCls()}>
            <option value="">Select...</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>

        <FormField label="Device Type" icon={<Monitor className="w-3.5 h-3.5" />}>
          <select value={form.deviceType} onChange={e => onChange('deviceType', e.target.value)} className={selectCls()}>
            <option value="">Select...</option>
            {DEVICE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </FormField>
      </div>

      {/* Result panel */}
      {result && action && (
        <div className={`border-t ${accentBorder} ${accentBg} px-5 py-4`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Analysis Result</span>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${action.bg} ${action.border} border ${action.color}`}>
              {action.icon}
              {action.label}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-500 mb-1">Risk Score</p>
              <div className="flex items-end gap-1">
                <span className={`text-2xl font-bold ${result.risk >= 70 ? 'text-red-600' : result.risk >= 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {result.risk}%
                </span>
              </div>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${result.risk >= 70 ? 'bg-red-500' : result.risk >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${result.risk}%` }}
                />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-500 mb-1">Confidence</p>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-blue-600">{result.confidence}%</span>
              </div>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            <span className="font-medium text-gray-700">{form.model}</span> · {form.category || 'Uncategorised'} · ${parseFloat(form.amount || '0').toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

function isFormValid(form: TransactionFormData): boolean {
  return !!(form.amount && form.category && form.deviceType);
}

export default function TransactionAnalysis() {
  const navigate = useNavigate();
  const { setAnalysisData } = useTransactionAnalysis();

  const [form1, setForm1] = useState<TransactionFormData>(emptyForm());
  const [form2, setForm2] = useState<TransactionFormData>({ ...emptyForm(), model: 'Model B' });
  const [results, setResults] = useState<{ form1: { risk: number; confidence: number } | null; form2: { risk: number; confidence: number } | null }>({ form1: null, form2: null });
  const [analyzing, setAnalyzing] = useState(false);

  const updateForm1 = (field: keyof TransactionFormData, value: string) => setForm1(f => ({ ...f, [field]: value }));
  const updateForm2 = (field: keyof TransactionFormData, value: string) => setForm2(f => ({ ...f, [field]: value }));

  const handleAnalyze = () => {
    const f1Valid = isFormValid(form1);
    const f2Valid = isFormValid(form2);
    if (!f1Valid && !f2Valid) return;

    setAnalyzing(true);
    setTimeout(() => {
      const r1 = f1Valid ? computeScore(form1) : null;
      const r2 = f2Valid ? computeScore(form2) : null;
      setResults({ form1: r1, form2: r2 });
      setAnalyzing(false);
    }, 900);
  };

  const handleViewDashboard = () => {
    const r1 = results.form1;
    const r2 = results.form2;
    const time1 = form1.transactionTime || '14:00';
    const time2 = form2.transactionTime || '14:00';

    setAnalysisData({
      transaction1: r1 ? {
        risk: r1.risk,
        confidence: r1.confidence,
        time: time1,
        label: `${form1.model} · Txn 1`,
        amount: parseFloat(form1.amount) || 0,
        model: form1.model,
        category: form1.category,
        customerId: form1.customerId,
      } : null,
      transaction2: r2 ? {
        risk: r2.risk,
        confidence: r2.confidence,
        time: time2,
        label: `${form2.model} · Txn 2`,
        amount: parseFloat(form2.amount) || 0,
        model: form2.model,
        category: form2.category,
        customerId: form2.customerId,
      } : null,
    });
    navigate('/risk-intelligence');
  };

  const bothAnalyzed = results.form1 || results.form2;
  const canAnalyze = isFormValid(form1) || isFormValid(form2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-semibold text-gray-900">Transaction Analysis</h1>
          </div>
          <p className="text-sm text-gray-600">
            Simulate transactions and compare AI model outputs. Results will be overlaid on the Risk Intelligence dashboard.
          </p>
        </div>
        {bothAnalyzed && (
          <button
            onClick={handleViewDashboard}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            View in Dashboard
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Instruction bar */}
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-600">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="flex items-center justify-center w-5 h-5 bg-slate-200 rounded-full text-xs font-semibold text-slate-600">1</span>
          Fill one or both forms
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
        <div className="flex items-center gap-2 text-slate-400">
          <span className="flex items-center justify-center w-5 h-5 bg-slate-200 rounded-full text-xs font-semibold text-slate-600">2</span>
          Select AI model per transaction
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
        <div className="flex items-center gap-2 text-slate-400">
          <span className="flex items-center justify-center w-5 h-5 bg-slate-200 rounded-full text-xs font-semibold text-slate-600">3</span>
          Click Analyze
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
        <div className="flex items-center gap-2 text-slate-400">
          <span className="flex items-center justify-center w-5 h-5 bg-slate-200 rounded-full text-xs font-semibold text-slate-600">4</span>
          View highlighted results in dashboard
        </div>
      </div>

      {/* Dual Forms */}
      <div className="grid grid-cols-2 gap-6">
        <FormPanel
          index={1}
          form={form1}
          onChange={updateForm1}
          result={results.form1}
          accentColor="bg-red-500"
          accentBg="bg-red-50"
          accentBorder="border-red-200"
          accentText="text-red-600"
        />
        <FormPanel
          index={2}
          form={form2}
          onChange={updateForm2}
          result={results.form2}
          accentColor="bg-blue-500"
          accentBg="bg-blue-50"
          accentBorder="border-blue-200"
          accentText="text-blue-600"
        />
      </div>

      {/* Analyze CTA */}
      <div className="flex items-center justify-center pt-2">
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze || analyzing}
          className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
            canAnalyze && !analyzing
              ? 'bg-slate-900 text-white hover:bg-slate-700 cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Zap className={`w-4 h-4 ${analyzing ? 'animate-pulse' : ''}`} />
          {analyzing ? 'Analyzing...' : 'Analyze Transaction(s)'}
          {!analyzing && <Cpu className="w-4 h-4 opacity-50" />}
        </button>
      </div>

      {/* Comparison table (shown after analysis) */}
      {results.form1 && results.form2 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Model Comparison Summary</h3>
            <p className="text-xs text-gray-500 mt-0.5">Side-by-side comparison of both submitted transactions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Metric</th>
                  <th className="px-6 py-3 text-center">
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                      <span className="text-xs font-medium text-gray-700">Transaction 1 · {form1.model}</span>
                    </span>
                  </th>
                  <th className="px-6 py-3 text-center">
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                      <span className="text-xs font-medium text-gray-700">Transaction 2 · {form2.model}</span>
                    </span>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">Δ Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-gray-600 font-medium">Risk Score</td>
                  <td className="px-6 py-3 text-center">
                    <span className={`font-semibold ${results.form1.risk >= 70 ? 'text-red-600' : results.form1.risk >= 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {results.form1.risk}%
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`font-semibold ${results.form2.risk >= 70 ? 'text-red-600' : results.form2.risk >= 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {results.form2.risk}%
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${Math.abs(results.form1.risk - results.form2.risk) > 15 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                      {results.form1.risk > results.form2.risk ? '+' : ''}{results.form1.risk - results.form2.risk}pp
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-gray-600 font-medium">Confidence</td>
                  <td className="px-6 py-3 text-center font-semibold text-blue-600">{results.form1.confidence}%</td>
                  <td className="px-6 py-3 text-center font-semibold text-blue-600">{results.form2.confidence}%</td>
                  <td className="px-6 py-3 text-center">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {results.form1.confidence > results.form2.confidence ? '+' : ''}{results.form1.confidence - results.form2.confidence}pp
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-gray-600 font-medium">Recommended Action</td>
                  <td className="px-6 py-3 text-center">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getRecommendedAction(results.form1.risk, results.form1.confidence).bg} ${getRecommendedAction(results.form1.risk, results.form1.confidence).border} ${getRecommendedAction(results.form1.risk, results.form1.confidence).color}`}>
                      {getRecommendedAction(results.form1.risk, results.form1.confidence).label}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getRecommendedAction(results.form2.risk, results.form2.confidence).bg} ${getRecommendedAction(results.form2.risk, results.form2.confidence).border} ${getRecommendedAction(results.form2.risk, results.form2.confidence).color}`}>
                      {getRecommendedAction(results.form2.risk, results.form2.confidence).label}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center text-gray-400 text-xs">—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-indigo-50 border-t border-indigo-100 flex items-center justify-between">
            <p className="text-sm text-indigo-700">
              <span className="font-medium">Ready to visualize.</span> These transactions will appear as highlighted markers across all 3 Risk Intelligence charts.
            </p>
            <button
              onClick={handleViewDashboard}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Open Risk Intelligence
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
