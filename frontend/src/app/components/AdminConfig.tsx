import { useState } from 'react';
import { AlertTriangle, Settings } from 'lucide-react';

interface AdminConfigProps {
  onWeightsChange?: (weights: RiskWeights) => void;
}

export function AdminConfig({ onWeightsChange }: AdminConfigProps) {
  const [weights, setWeights] = useState<RiskWeights>(defaultWeights);
  const [showWarning, setShowWarning] = useState(false);

  const handleWeightChange = (key: keyof RiskWeights, value: number) => {
    const newWeights = { ...weights, [key]: value };
    setWeights(newWeights);
    
    // Show warning if any weight is below 0.3 or above 0.95
    const hasExtreme = Object.values(newWeights).some(w => w < 0.3 || w > 0.95);
    setShowWarning(hasExtreme);
    
    onWeightsChange?.(newWeights);
  };

  const resetToDefaults = () => {
    setWeights(defaultWeights);
    setShowWarning(false);
    onWeightsChange?.(defaultWeights);
  };

  const weightConfigs = [
    { key: 'ipAnomaly' as keyof RiskWeights, label: 'IP Anomaly', description: 'Weight for unusual IP address patterns' },
    { key: 'geoAnomaly' as keyof RiskWeights, label: 'Geo Anomaly', description: 'Weight for geographic location mismatches' },
    { key: 'velocity' as keyof RiskWeights, label: 'Transaction Velocity', description: 'Weight for transaction frequency patterns' },
    { key: 'deviceMismatch' as keyof RiskWeights, label: 'Device Mismatch', description: 'Weight for device inconsistencies' },
    { key: 'amountDeviation' as keyof RiskWeights, label: 'Amount Deviation', description: 'Weight for unusual transaction amounts' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Adaptive Risk Weights</h2>
        </div>
        <button
          onClick={resetToDefaults}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Reset to Defaults
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Adjust risk factor weights to adapt the fraud detection model to evolving attack patterns.
        Changes take effect immediately for new transaction scoring.
      </p>

      {showWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-900">Warning: Extreme Weight Values</h4>
            <p className="text-sm text-yellow-800 mt-1">
              Very low or very high weights may increase false positives/negatives. Monitor impact closely.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {weightConfigs.map(({ key, label, description }) => (
          <div key={key}>
            <div className="flex justify-between items-center mb-2">
              <div>
                <label className="text-sm font-medium text-gray-900">{label}</label>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
              <span className="text-sm font-semibold text-gray-900 min-w-[3rem] text-right">
                {weights[key].toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights[key]}
              onChange={(e) => handleWeightChange(key, parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0.0</span>
              <span>1.0</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Impact Preview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <span className="text-xs text-blue-700 font-medium">Estimated False Positives</span>
            <p className="text-lg font-semibold text-blue-900 mt-1">
              {calculateFalsePositiveRate(weights)}%
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <span className="text-xs text-purple-700 font-medium">Model Sensitivity</span>
            <p className="text-lg font-semibold text-purple-900 mt-1">
              {calculateSensitivity(weights)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateFalsePositiveRate(weights: RiskWeights): number {
  // Simplified calculation: higher weights generally = more false positives
  const avgWeight = (weights.ipAnomaly + weights.geoAnomaly + weights.velocity + 
                      weights.deviceMismatch + weights.amountDeviation) / 5;
  return Math.round((avgWeight - 0.5) * 20 + 15);
}

function calculateSensitivity(weights: RiskWeights): number {
  // Simplified calculation: higher weights = higher sensitivity
  const avgWeight = (weights.ipAnomaly + weights.geoAnomaly + weights.velocity + 
                      weights.deviceMismatch + weights.amountDeviation) / 5;
  return Math.round(avgWeight * 100);
}
