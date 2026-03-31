import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { Shield, BarChart3, Activity, LogOut, User, FlaskConical } from 'lucide-react';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">Fraud Detection</h1>
              <p className="text-xs text-slate-400">Risk Scoring System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/dashboard')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="text-sm font-medium">Operational Dashboard</span>
          </Link>

          <Link
            to="/risk-intelligence"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/risk-intelligence')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm font-medium">Risk Intelligence</span>
          </Link>

          <Link
            to="/transaction-analysis"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/transaction-analysis')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FlaskConical className="w-5 h-5" />
            <span className="text-sm font-medium">Transaction Analysis</span>
          </Link>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="bg-slate-700 p-2 rounded-full">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Fraud Analyst</p>
              <p className="text-xs text-slate-400">analyst@bank.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1440px] mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
