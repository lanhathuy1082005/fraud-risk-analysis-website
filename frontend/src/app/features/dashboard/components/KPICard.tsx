interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function KPICard({ title, value, subtitle, trend }: KPICardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-sm text-gray-600 mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-gray-900">{value}</span>
        {trend && (
          <span className={`text-sm ${
            trend === 'up' ? 'text-red-600' : 
            trend === 'down' ? 'text-green-600' : 
            'text-gray-600'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '−'}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
