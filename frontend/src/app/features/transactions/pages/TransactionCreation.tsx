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
  Zap,
} from 'lucide-react';
import { apiCreateTransaction, apiMockTransactions } from '../services/api';

// ─── types ───────────────────────────────────────────────────────────────────

enum Gender{
    F = "F",
    M = "M",
    U = "U"
}

enum Category {
    contents = "es_contents",
    fashion = "es_fashion",
    food = "es_food",
    health = "es_health",
    home = "es_home",
    hotel_services = "es_hotelservices",
    hyper = "es_hyper",
    leisure = "es_leisure",
    other_services = "es_otherservices",
    sports_and_toys = "es_sportsandtoys",
    tech = "es_tech",
    transportation = "es_transportation",
    travel = "es_travel",
    wellness_and_beauty = "es_wellnessandbeauty"
}


  
interface TransactionFormData {
  customerId:      number | null;
  amount:          string;
  merchantName:      string;
  transactionTime: string;
  customerGender: Gender;
  DoB:        string;
  category:        Category;
  deviceName:      string;
}

const emptyForm = (): TransactionFormData => ({
  customerId:      null,
  amount:          '',
  merchantName:      '',
  transactionTime: '',
  customerGender: Gender.U,
  DoB:'',
  category: Category.contents,
  deviceName:      '',
});

// ─── constants ────────────────────────────────────────────────────────────────

const GENDERS     = [
  { label: "Male", value: "M" },
  { label: "Female", value: "F" },
  { label: "Other", value: "U" },
] as const;

const CATEGORIES  = [
  { label: "Contents", value: "es_contents" },
  { label: "Fashion", value: "es_fashion" },
  { label: "Food", value: "es_food" },
  { label: "Health", value: "es_health" },
  { label: "Home", value: "es_home" },
  { label: "Hotel Services", value: "es_hotelservices" },
  { label: "Hyper", value: "es_hyper" },
  { label: "Leisure", value: "es_leisure" },
  { label: "Other Services", value: "es_otherservices" },
  { label: "Sports and Toys", value: "es_sportsandtoys" },
  { label: "Tech", value: "es_tech" },
  { label: "Transportation", value: "es_transportation" },
  { label: "Travel", value: "es_travel" },
  { label: "Wellness and Beauty", value: "es_wellnessandbeauty" }
] as const;
const DEVICE_TYPES = ['Mobile', 'Desktop', 'Tablet', 'Unknown'] as const;

// ─── component ───────────────────────────────────────────────────────────────

export default function TransactionAnalysis() {
  const navigate = useNavigate();
  const [form, setForm] = useState<TransactionFormData>(emptyForm());

  const handleChange = (field: keyof TransactionFormData, value: string) => {
    setForm(prev => ({ ...prev,
    [field]: field === 'customerId' ? (value === '' ? null : Number(value)) : value,
    }));
  };

  const handleCreate = async () => {
  try {
    const response = {
      amount: parseFloat(form.amount),
      time: form.transactionTime
        ? new Date(form.transactionTime).toISOString()
        : new Date().toISOString(),
      category: form.category,
      merchant_name: form.merchantName,
      customer_id: Number(form.customerId),
      device_name: form.deviceName,
      customer_dob: form.DoB,
      customer_gender: form.customerGender,
      model_key: 'log'
    };
    await apiCreateTransaction(response);
  } catch (e) {
    console.error('Create transaction error:', e);  
    alert(`Failed to create transaction: ${String(e)}`);
  } finally {
    navigate('/dashboard', { state: { newCustomerId: Number(form.customerId), highlightNew: true } });
  }
};

  const handleMockData = async () => {
    await apiMockTransactions();
    navigate('/dashboard');
  }

  const isFormValid = form.customerId && form.amount && form.merchantName && 
                      form.transactionTime && form.customerGender && form.DoB && 
                      form.category && form.deviceName;

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Transaction Details</h2>

            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Customer ID
                </label>
                <input
                  type="number"
                  value={form.customerId || ''}
                  onChange={e => handleChange('customerId', e.target.value)}
                  placeholder="e.g., 001"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Store className="w-4 h-4 inline mr-2" />
                  Merchant Name
                </label>
                <input
                  type="text"
                  value={form.merchantName}
                  onChange={e => handleChange('merchantName', e.target.value)}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Gender
                </label>
                <select
                  value={form.customerGender}
                  onChange={e => handleChange('customerGender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select gender...</option>
                  {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={form.DoB}
                  onChange={e => handleChange('DoB', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Monitor className="w-4 h-4 inline mr-2" />
                  Device Type
                </label>
                <select
                  value={form.deviceName}
                  onChange={e => handleChange('deviceName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select device...</option>
                  {DEVICE_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                </select>
              </div>
            </div>

            {/* Generate Mock Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actions
              </label>
              <button
                onClick={handleMockData}
                className='px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition'
                style={{
                  padding: "10px 16px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Generate Mock Data
              </button>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <button
                onClick={handleCreate}
                disabled={!isFormValid}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Create Transaction
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
