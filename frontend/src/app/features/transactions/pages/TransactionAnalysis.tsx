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
  else if (form.deviceType === 'Mobile')  { risk += 8;  confidence -= 5;  }
  else if (form.deviceType === 'Tablet')  { risk += 4;  confidence -= 2;  }

  // Gender
  if (form.gender === 'Undefined') { confidence -= 12; }

  // Model selection
  if (form.model === 'Model B') { confidence += 10; }

  // Clamp values
  risk       = Math.max(0, Math.min(100, risk));
  confidence = Math.max(10, Math.min(100, confidence));

  return { risk, confidence };
}

// ─── component ───────────────────────────────────────────────────────────────

export default function TransactionAnalysis() {
  const navigate = useNavigate();
  const [form, setForm] = useState<TransactionFormData>(emptyForm());
  const [result, setResult] = useState<{ risk: number; confidence: number } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const score = computeScore(form);
  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'text-red-600 bg-red-50 border-red-300';
    if (risk >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-300';
    return 'text-green-600 bg-green-50 border-green-300';
  };

  const handleChange = (field: keyof TransactionFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSubmitted(false);
  };

  const handleAnalyze = () => {
    setResult(score);
    setSubmitted(true);
  };

  const handleReset = () => {
    setForm(emptyForm());
    setResult(null);
    setSubmitted(false);
  };

  const isFormValid = form.customerId && form.amount && form.merchantId && 
                      form.transactionTime && form.gender && form.ageGroup && 
                      form.category && form.deviceType;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FlaskConical className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Transaction Analysis</h1>
          </div>
          <p className="text-sm text-gray-600">
            Simulate transactions and analyze fraud risk scores with model confidence
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Transaction Details</h2>

            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Customer ID
                </label>
                <input
                  type="text"
                  value={form.customerId}
                  onChange={e => handleChange('customerId', e.target.value)}
                  placeholder="e.g., CUST001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => handleChange('amount', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Store className="w-4 h-4 inline mr-2" />
                  Merchant ID
                </label>
                <input
                  type="text"
                  value={form.merchantId}
                  onChange={e => handleChange('merchantId', e.target.value)}
                  placeholder="e.g., MERCH123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Transaction Time
                </label>
                <input
                  type="datetime-local"
                  value={form.transactionTime}
                  onChange={e => handleChange('transactionTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Gender
                </label>
                <select
                  value={form.gender}
                  onChange={e => handleChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select gender...</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Age Group
                </label>
                <select
                  value={form.ageGroup}
                  onChange={e => handleChange('ageGroup', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select age group...</option>
                  {AGE_GROUPS.map(ag => <option key={ag} value={ag}>{ag}</option>)}
                </select>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-2" />
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={e => handleChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Monitor className="w-4 h-4 inline mr-2" />
                  Device Type
                </label>
                <select
                  value={form.deviceType}
                  onChange={e => handleChange('deviceType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select device...</option>
                  {DEVICE_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                </select>
              </div>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Cpu className="w-4 h-4 inline mr-2" />
                ML Model
              </label>
              <div className="grid grid-cols-2 gap-3">
                {MODELS.map(m => (
                  <button
                    key={m}
                    onClick={() => handleChange('model', m)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      form.model === m
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium">{m}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAnalyze}
                disabled={!isFormValid}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Analyze Transaction
              </button>
              <button
                onClick={handleReset}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 sticky top-8">
            <h2 className="text-lg font-semibold text-gray-900">Analysis Result</h2>

            {submitted && result ? (
              <>
                {/* Risk Score */}
                <div className={`p-4 rounded-lg border border-dashed ${getRiskColor(result.risk)}`}>
                  <div className="text-sm font-medium mb-1">Fraud Risk Score</div>
                  <div className="text-3xl font-bold">{result.risk.toFixed(1)}%</div>
                  <div className="text-xs mt-2">
                    {result.risk >= 70 ? '🔴 High Risk' : result.risk >= 40 ? '🟡 Medium Risk' : '🟢 Low Risk'}
                  </div>
                </div>

                {/* Confidence */}
                <div className="p-4 rounded-lg border border-dashed border-blue-300 bg-blue-50">
                  <div className="text-sm font-medium text-blue-700 mb-1">Model Confidence</div>
                  <div className="text-3xl font-bold text-blue-900">{result.confidence.toFixed(1)}%</div>
                  <div className="text-xs text-blue-600 mt-2">
                    {result.confidence >= 70 ? '✓ High Confidence' : '⚠ Low Confidence'}
                  </div>
                </div>

                {/* Risk Level Badge */}
                <div className="p-3 rounded-lg bg-gray-50">
                  <div className="flex items-start gap-2">
                    {result.risk >= 70 && result.confidence >= 70 && (
                      <>
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-semibold text-red-900">Action Required</div>
                          <div className="text-xs text-red-700">High Risk + High Confidence</div>
                        </div>
                      </>
                    )}
                    {result.risk >= 70 && result.confidence < 70 && (
                      <>
                        <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-semibold text-yellow-900">Review Needed</div>
                          <div className="text-xs text-yellow-700">High Risk + Low Confidence</div>
                        </div>
                      </>
                    )}
                    {result.risk < 70 && (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-semibold text-green-900">Likely Safe</div>
                          <div className="text-xs text-green-700">Low to medium risk</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <FlaskConical className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500 text-center">
                  Fill in the form and analyze a transaction to see results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
