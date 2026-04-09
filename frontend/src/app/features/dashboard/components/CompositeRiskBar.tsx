interface CompositeRiskBarProps {
  riskScore: number;
  confidenceScore: number;
  size?: 'small' | 'large';
}

export function CompositeRiskBar({ riskScore, confidenceScore, size = 'large' }: CompositeRiskBarProps) {
  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'rgb(220, 38, 38)'; // red-600
    if (risk >= 40) return 'rgb(234, 179, 8)'; // yellow-500
    return 'rgb(22, 163, 74)'; // green-600
  };

  const getOpacity = (confidence: number) => {
    // High confidence = full opacity, low confidence = faded
    return confidence / 100;
  };

  const getRiskLabel = () => {
    if (riskScore*100 >= 70 && confidenceScore*100 >= 70) return 'High Risk - High Confidence';
    if (riskScore*100 >= 70 && confidenceScore*100 < 70) return 'High Risk - Low Confidence';
    if (riskScore*100 < 40 && confidenceScore*100 >= 70) return 'Low Risk - High Confidence';
    if (riskScore*100 < 40 && confidenceScore*100 < 70) return 'Low Risk - Low Confidence';
    return 'Medium Risk';
  };

  const barColor = getRiskColor(riskScore*100);
  const opacity = getOpacity(confidenceScore*100);
  const height = size === 'small' ? '8px' : '24px';

  return (
    <div className="space-y-1">
      <div 
        className={`w-full bg-gray-100 rounded-full overflow-hidden`}
        style={{ height }}
      >
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${riskScore*100}%`,
            backgroundColor: barColor,
            opacity: Math.max(opacity, 0.3),
            backgroundImage: confidenceScore*100 < 50 ? 
              'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 8px)' 
              : 'none'
          }}
        />
      </div>
      {size === 'large' && (
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-600">
            Risk: {riskScore*100}% | Confidence: {confidenceScore*100}%
          </span>
          <span className="text-gray-500 italic">{getRiskLabel()}</span>
        </div>
      )}
    </div>
  );
}
