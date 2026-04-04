import { Transaction } from '../data/mockData';
import { X, AlertTriangle, CheckCircle, Shield, Ban } from 'lucide-react';
import { CompositeRiskBar } from './CompositeRiskBar';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onEscalate: (id: string) => void;
  onBlock: (id: string) => void;
}

export function TransactionDetailModal({
  transaction,
  onClose,
  onApprove,
  onEscalate,
  onBlock,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  const showWarning = transaction.riskScore >= 70 && transaction.confidenceLevel < 70;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Transaction Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning Banner */}
          {showWarning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-900">High Risk with Low Confidence</h4>
                <p className="text-sm text-yellow-800 mt-1">
                  This transaction shows high risk indicators, but the model has low confidence.
                  Manual review strongly recommended before taking action.
                </p>
              </div>
            </div>
          )}

          {/* Transaction Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-600">Transaction ID</label>
              <p className="text-base font-medium text-gray-900 mt-1">{transaction.id}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Amount</label>
              <p className="text-base font-medium text-gray-900 mt-1">
                ${transaction.amount.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Timestamp</label>
              <p className="text-base font-medium text-gray-900 mt-1">
                {transaction.timestamp.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Risk & Confidence */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Fraud Score</h3>
            <CompositeRiskBar
              riskScore={transaction.riskScore}
              confidenceLevel={transaction.confidenceLevel}
            />
          </div>

          {/* Contributing Factors */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Contributing Factors</h3>
            <div className="space-y-3">
              <FactorBar label="IP Anomaly" value={transaction.factors.ipAnomaly} />
              <FactorBar label="Geo Mismatch" value={transaction.factors.geoMismatch} />
              <FactorBar label="Transaction Velocity" value={transaction.factors.velocity} />
              <FactorBar label="Device Inconsistency" value={transaction.factors.deviceInconsistency} />
              <FactorBar label="Amount Deviation" value={transaction.factors.amountDeviation} />
            </div>
          </div>

          {/* Model Explanation */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Model Explanation</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {transaction.riskScore >= 70 ? (
                <>
                  This transaction exhibits <strong>high-risk characteristics</strong>: unusual geographic
                  location ({transaction.location}), IP address anomaly, and device inconsistency patterns.
                  {transaction.confidenceLevel < 70 && (
                    <> However, the model has <strong>limited confidence</strong> in this assessment due to
                    sparse historical data for this pattern.</>
                  )}
                </>
              ) : transaction.riskScore >= 40 ? (
                <>
                  This transaction shows <strong>moderate risk</strong> with some anomalous patterns.
                  The model confidence is {transaction.confidenceLevel >= 70 ? 'high' : 'moderate'}.
                </>
              ) : (
                <>
                  This transaction appears <strong>normal</strong> with low risk indicators.
                  The model has {transaction.confidenceLevel >= 70 ? 'high' : 'moderate'} confidence
                  in this assessment.
                </>
              )}
            </p>
          </div>

          {/* Recommended Action */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Recommended Action</h3>
            <p className="text-sm text-blue-800">
              {transaction.riskScore >= 70 && transaction.confidenceLevel >= 70 && 'Auto-escalate to senior analyst for immediate review.'}
              {transaction.riskScore >= 70 && transaction.confidenceLevel < 70 && 'Manual review required due to model uncertainty.'}
              {transaction.riskScore < 40 && transaction.confidenceLevel >= 70 && 'Safe to approve - low risk with high confidence.'}
              {transaction.riskScore < 40 && transaction.confidenceLevel < 70 && 'Monitor - uncertain classification.'}
              {transaction.riskScore >= 40 && transaction.riskScore < 70 && 'Review additional context before decision.'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onApprove(transaction.id);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={() => {
              onEscalate(transaction.id);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Escalate
          </button>
          <button
            onClick={() => {
              onBlock(transaction.id);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Ban className="w-4 h-4" />
            Block
          </button>
        </div>
      </div>
    </div>
  );
}

function FactorBar({ label, value }: { label: string; value: number }) {
  const percentage = Math.round(value * 100);
  const color = value >= 0.7 ? 'bg-red-500' : value >= 0.4 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-700">{label}</span>
        <span className="text-xs text-gray-600">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
