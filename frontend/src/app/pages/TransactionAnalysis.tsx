import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  FlaskConical,
  User,
  DollarSign,
  Store,
  Clock,
  Users,
  Tag,
  Monitor,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useTransactionAnalysis } from '../context/TransactionAnalysisContext';

// ─── types ───────────────────────────────────────────────────────────────────

interface TransactionFormData {
  customerId:      string;
  amount:          string;
  merchantId:      string;
  transactionTime: string;
  gender:          string;
  ageGroup:        string;
  category:        string;
  deviceType:      string;
  model:           'Model A' | 'Model B';
}

const emptyForm = (): TransactionFormData => ({
  customerId:      '',
  amount:          '',
  merchantId:      '',
  transactionTime: '',
  gender:          '',
  ageGroup:        '',
  category:        '',
  deviceType:      '',
  model:           'Model A',
});

// ─── constants ────────────────────────────────────────────────────────────────

const GENDERS     = ['Male', 'Female', 'Undefined'] as const;
const AGE_GROUPS  = ['Under 18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'] as const;
const CATEGORIES  = [
  'Contents',
  'Fashion',
  'Food',
  'Health',
  'Home',
  'Hotel Services',
  'Hyper',
  'Leisure',
  'Other Services',
  'Sports and Toys',
  'Tech',
  'Transportation',
  'Travel',
  'Wellness and Beauty',
] as const;
const DEVICE_TYPES = ['Mobile', 'Desktop', 'Tablet', 'Unknown'] as const;
const MODELS      = ['Model A', 'Model B'] as const;

// ─── scoring ─────────────────────────────────────────────────────────────────

function computeScore(form: TransactionFormData): { risk: number; confidence: number } {
  let risk       = 0;
  let confidence = 70;

  // Amount
  const amount = parseFloat(form.amount) || 0;
  if      (amount > 10000) risk += 35;
  else if (amount > 5000)  risk += 22;
  else if (amount > 1000)  risk += 10;
  else                     risk += 2;

  // Category
  if      (form.category === 'Travel')           { risk += 12; }
  else if (form.category === 'Tech')             { risk += 18; }
  else if (form.category === 'Hotel Services')   { risk += 10; }
  else if (form.category === 'Transportation')   { risk += 8;  }
  else if (form.category === 'Food')             { risk += 3;  }
  else if (form.category === 'Hyper')            { risk += 5;  }
  else if (form.category === 'Leisure')          { risk += 6;  }
  else if (form.category === 'Sports and Toys')  { risk += 7;  }
  else if (form.category === 'Wellness and Beauty') { risk += 4; }
  else if (form.category === 'Fashion')          { risk += 5;  }
  else if (form.category === 'Home')             { risk += 3;  }
  else if (form.category === 'Contents')         { risk += 4;  }
  else if (form.category === 'Health')           { risk += 3;  }
  else                                           { risk += 2;  }

  // Device
  if      (form.deviceType === 'Unknown') { risk += 22; confidence -= 18; }
  else if (form.deviceType === 'Desktop') { risk += 5;  confidence += 5;  }
  else if (form.deviceType === 'Mobile')  { risk += 3;  confidence += 8;  }
  else if (form.deviceType === 'Tablet')  { risk += 4;  confidence += 4;  }

  // Age group
  if      (form.ageGroup === 'Under 18') { risk += 14; confidence -= 5; }
  else if (form.ageGroup === '18-24')    { risk += 8;  }
  else if (form.ageGroup === '65+')      { risk += 12; }
  else                                   { risk += 2;  }

  // Model B has slightly different scoring
  if (form.model === 'Model B') {
    risk       = Math.max(0, risk - 5 + Math.floor(risk * 0.1));
    confidence = Math.max(20, confidence + 5);
  }

  // Late-night transactions
  const hour = parseInt((form.transactionTime || '12:00').split(':')[0]);
  if (hour >= 1 && hour <= 5) { risk += 15; confidence -= 10; }

  return {
    risk:       Math.min(98, Math.max(2,  risk)),
    confidence: Math.min(97, Math.max(22, confidence)),
  };
}

// ─── recommended action ───────────────────────────────────────────────────────

interface ActionResult {
  label:  string;
  color:  string;
  icon:   React.ReactNode;
  bg:     string;
  border: string;
}

function getRecommendedAction(risk: number, confidence: number): ActionResult {
  if (risk >= 70 && confidence >= 70) return {
    label: 'Auto Escalate', color: 'text-red-700',
    icon: <AlertTriangle className="w-4 h-4" />,
    bg: 'bg-red-50', border: 'border-red-200',
  };
  if (risk >= 70 && confidence < 70) return {
    label: 'Manual Review', color: 'text-orange-700',
    icon: <Info className="w-4 h-4" />,
    bg: 'bg-orange-50', border: 'border-orange-200',
  };
  if (risk < 40 && confidence >= 70) return {
    label: 'Approve — Safe', color: 'text-green-700',
    icon: <CheckCircle2 className="w-4 h-4" />,
    bg: 'bg-green-50', border: 'border-green-200',
  };
  return {
    label: 'Monitor', color: 'text-gray-700',
    icon: <Info className="w-4 h-4" />,
    bg: 'bg-gray-50', border: 'border-gray-200',
  };
}

// ─── shared input styles ──────────────────────────────────────────────────────

const inputCls = 'w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
const selectCls = 'w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none';

// ─── form field wrapper ───────────────────────────────────────────────────────

function FormField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
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

// ─── validation ───────────────────────────────────────────────────────────────

function isFormValid(form: TransactionFormData): boolean {
  return !!(form.amount && form.category && form.deviceType);
}

// ─── main component ───────────────────────────────────────────────────────────

export default function TransactionAnalysis() {
  const navigate             = useNavigate();
  const { setAnalysisData }  = useTransactionAnalysis();

  const [form,      setForm]      = useState<TransactionFormData>(emptyForm());
  const [result,    setResult]    = useState<{ risk: number; confidence: number } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const updateField = (field: keyof TransactionFormData, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    // Clear result when form changes so stale data is never shown
    setResult(null);
  };

  // ── analyze ──────────────────────────────────────────────────────────────
  const handleAnalyze = () => {
    if (!isFormValid(form)) return;
    setAnalyzing(true);
    setTimeout(() => {
      setResult(computeScore(form));
      setAnalyzing(false);
    }, 800);
  };

  // ── send to dashboard ────────────────────────────────────────────────────
  const handleViewDashboard = () => {
    if (!result) return;
    setAnalysisData({
      transaction1: {
        risk:       result.risk,
        confidence: result.confidence,
        time:       form.transactionTime || '14:00',
        label:      `${form.model} · Transaction`,
        amount:     parseFloat(form.amount) || 0,
        model:      form.model,
        category:   form.category,
        customerId: form.customerId,
      },
      transaction2: null,
    });
    navigate('/risk-intelligence');
  };

  const action = result ? getRecommendedAction(result.risk, result.confidence) : null;

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-semibold text-gray-900">Transaction Analysis</h1>
          </div>
          <p className="text-sm text-gray-600">
            Simulate a transaction and run it through the selected AI model to generate a risk score.
          </p>
        </div>
        {result && (
          <button
            onClick={handleViewDashboard}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            View in Dashboard
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Centered Single Form ── */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

          {/* Form header */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <FlaskConical className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Transaction Details</h3>
                <p className="text-xs text-gray-500">Fill in the transaction data below to generate a risk assessment</p>
              </div>
            </div>
          </div>

          {/* Form body */}
          <div className="p-6 space-y-5">

            {/* Row 1: Customer ID + Amount */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Customer ID" icon={<User className="w-3.5 h-3.5" />}>
                <input
                  type="text"
                  placeholder="e.g. CUST-10042"
                  value={form.customerId}
                  onChange={e => updateField('customerId', e.target.value)}
                  className={inputCls}
                />
              </FormField>

              <FormField label="Amount (USD)" icon={<DollarSign className="w-3.5 h-3.5" />}>
                <input
                  type="number"
                  placeholder="e.g. 2500"
                  value={form.amount}
                  onChange={e => updateField('amount', e.target.value)}
                  className={inputCls}
                />
              </FormField>
            </div>

            {/* Row 2: Merchant ID + Transaction Time */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Merchant ID" icon={<Store className="w-3.5 h-3.5" />}>
                <input
                  type="text"
                  placeholder="e.g. MERCH-5021"
                  value={form.merchantId}
                  onChange={e => updateField('merchantId', e.target.value)}
                  className={inputCls}
                />
              </FormField>

              <FormField label="Transaction Time" icon={<Clock className="w-3.5 h-3.5" />}>
                <input
                  type="time"
                  value={form.transactionTime}
                  onChange={e => updateField('transactionTime', e.target.value)}
                  className={inputCls}
                />
              </FormField>
            </div>

            {/* Row 3: Gender + Age Group */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Gender" icon={<Users className="w-3.5 h-3.5" />}>
                <select
                  value={form.gender}
                  onChange={e => updateField('gender', e.target.value)}
                  className={selectCls}
                >
                  <option value="">Select gender…</option>
                  {GENDERS.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Age Group" icon={<User className="w-3.5 h-3.5" />}>
                <select
                  value={form.ageGroup}
                  onChange={e => updateField('ageGroup', e.target.value)}
                  className={selectCls}
                >
                  <option value="">Select age group…</option>
                  {AGE_GROUPS.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </FormField>
            </div>

            {/* Row 4: Category + Device Type */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Category" icon={<Tag className="w-3.5 h-3.5" />}>
                <select
                  value={form.category}
                  onChange={e => updateField('category', e.target.value)}
                  className={selectCls}
                >
                  <option value="">Select category…</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Device Type" icon={<Monitor className="w-3.5 h-3.5" />}>
                <select
                  value={form.deviceType}
                  onChange={e => updateField('deviceType', e.target.value)}
                  className={selectCls}
                >
                  <option value="">Select device…</option>
                  {DEVICE_TYPES.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </FormField>
            </div>

            {/* Row 5: AI Model (full width dropdown) */}
            <div className="pt-1 border-t border-gray-100">
              <FormField label="Select AI Model" icon={<Cpu className="w-3.5 h-3.5" />}>
                <select
                  value={form.model}
                  onChange={e => updateField('model', e.target.value as 'Model A' | 'Model B')}
                  className={selectCls}
                >
                  {MODELS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </FormField>
            </div>

          </div>

          {/* Form footer — Analyze button */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={handleAnalyze}
              disabled={!isFormValid(form) || analyzing}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isFormValid(form) && !analyzing
                  ? 'bg-slate-900 text-white hover:bg-slate-700 cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Zap className={`w-4 h-4 ${analyzing ? 'animate-pulse' : ''}`} />
              {analyzing ? 'Analysing…' : 'Analyse Transaction'}
            </button>
          </div>
        </div>

        {/* ── Result Panel (shown after analysis) ── */}
        {result && action && (
          <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden">

            {/* Result header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Analysis Result</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {form.model} · {form.category || 'N/A'} · ${parseFloat(form.amount || '0').toLocaleString()}
                </p>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${action.bg} ${action.border} ${action.color}`}>
                {action.icon}
                {action.label}
              </div>
            </div>

            {/* Score cards */}
            <div className="grid grid-cols-2 divide-x divide-gray-100">
              {/* Risk Score */}
              <div className="px-6 py-5">
                <p className="text-xs font-medium text-gray-500 mb-2">Risk Score</p>
                <p className={`text-3xl font-bold mb-2 ${result.risk >= 70 ? 'text-red-600' : result.risk >= 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {result.risk}%
                </p>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${result.risk >= 70 ? 'bg-red-500' : result.risk >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${result.risk}%` }}
                  />
                </div>
              </div>

              {/* Confidence Level */}
              <div className="px-6 py-5">
                <p className="text-xs font-medium text-gray-500 mb-2">Confidence Level</p>
                <p className="text-3xl font-bold text-blue-600 mb-2">{result.confidence}%</p>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Input summary */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">Input Summary</p>
              <div className="grid grid-cols-3 gap-x-6 gap-y-1 text-xs text-gray-600">
                {form.customerId  && <span><span className="text-gray-400">Customer:</span> {form.customerId}</span>}
                {form.merchantId  && <span><span className="text-gray-400">Merchant:</span> {form.merchantId}</span>}
                {form.gender      && <span><span className="text-gray-400">Gender:</span> {form.gender}</span>}
                {form.ageGroup    && <span><span className="text-gray-400">Age:</span> {form.ageGroup}</span>}
                {form.deviceType  && <span><span className="text-gray-400">Device:</span> {form.deviceType}</span>}
                {form.transactionTime && <span><span className="text-gray-400">Time:</span> {form.transactionTime}</span>}
              </div>
            </div>

            {/* View in dashboard CTA */}
            <div className="px-6 py-4 border-t border-indigo-100 bg-indigo-50 flex items-center justify-between">
              <p className="text-sm text-indigo-700">
                <span className="font-medium">Ready to visualize.</span>{' '}
                This transaction will appear as a highlighted marker on all Risk Intelligence charts.
              </p>
              <button
                onClick={handleViewDashboard}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex-shrink-0 ml-4"
              >
                Open Risk Intelligence
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
