import React from 'react';

const ConfidenceIndicator = ({ score, size = 'medium' }) => {
  const percentage = (score * 100).toFixed(0);
  
  const getColor = () => {
    if (score >= 0.9) return 'green';
    if (score >= 0.7) return 'blue';
    if (score >= 0.5) return 'yellow';
    return 'red';
  };
  
  const color = getColor();
  
  const sizeClasses = {
    small: 'w-12 h-12 text-xs',
    medium: 'w-16 h-16 text-sm',
    large: 'w-20 h-20 text-base'
  };
  
  const colorClasses = {
    green: 'bg-green-100 border-green-400 text-green-800',
    blue: 'bg-blue-100 border-blue-400 text-blue-800',
    yellow: 'bg-yellow-100 border-yellow-400 text-yellow-800',
    red: 'bg-red-100 border-red-400 text-red-800'
  };
  
  return (
    <div 
      className={`${sizeClasses[size]} ${colorClasses[color]} border-2 rounded-full flex items-center justify-center font-bold shadow-sm`}
      title={`${percentage}% confidence`}
    >
      {percentage}%
    </div>
  );
};

const SourceBadge = ({ source, confidence }) => {
  const sourceInfo = {
    voice: { icon: '🎤', label: 'Voice', color: 'purple' },
    ocr: { icon: '📸', label: 'OCR', color: 'blue' },
    manual: { icon: '⌨️', label: 'Manual', color: 'green' }
  };
  
  const info = sourceInfo[source] || { icon: '📝', label: 'Unknown', color: 'gray' };
  
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-800 border-purple-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    gray: 'bg-gray-100 text-gray-800 border-gray-300'
  };
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${colorClasses[info.color]} text-xs font-semibold`}>
      <span className="text-base">{info.icon}</span>
      <span>{info.label}</span>
      {confidence && (
        <span className="ml-1 opacity-75">
          {(confidence * 100).toFixed(0)}%
        </span>
      )}
    </div>
  );
};

const TrustIndicator = ({ transaction }) => {
  const { source, confidence_score } = transaction;
  const confidence = confidence_score || 1.0;
  
  const getTrustLevel = () => {
    if (source === 'manual') return 'verified';
    if (confidence >= 0.9) return 'high';
    if (confidence >= 0.7) return 'medium';
    return 'low';
  };
  
  const trustLevel = getTrustLevel();
  
  const trustInfo = {
    verified: {
      icon: '✅',
      label: 'Verified',
      color: 'green',
      message: 'Manually entered - 100% accurate'
    },
    high: {
      icon: '🟢',
      label: 'High Trust',
      color: 'green',
      message: 'AI detected with high confidence'
    },
    medium: {
      icon: '🟡',
      label: 'Medium Trust',
      color: 'yellow',
      message: 'AI detected - please verify'
    },
    low: {
      icon: '🔴',
      label: 'Low Trust',
      color: 'red',
      message: 'Requires manual verification'
    }
  };
  
  const info = trustInfo[trustLevel];
  
  const colorClasses = {
    green: 'bg-green-50 border-green-300 text-green-800',
    yellow: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    red: 'bg-red-50 border-red-300 text-red-800'
  };
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${colorClasses[info.color]}`}>
      <span className="text-lg">{info.icon}</span>
      <div className="text-xs">
        <div className="font-bold">{info.label}</div>
        <div className="opacity-75">{info.message}</div>
      </div>
    </div>
  );
};

const DataQualityBar = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return null;
  }
  
  const manualCount = transactions.filter(t => t.source === 'manual').length;
  const voiceCount = transactions.filter(t => t.source === 'voice').length;
  const ocrCount = transactions.filter(t => t.source === 'ocr').length;
  const total = transactions.length;
  
  const manualPercent = (manualCount / total) * 100;
  const voicePercent = (voiceCount / total) * 100;
  const ocrPercent = (ocrCount / total) * 100;
  
  const avgConfidence = transactions.reduce((sum, t) => {
    return sum + (t.confidence_score || 1.0);
  }, 0) / total;
  
  return (
    <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-gray-800">📊 Data Quality Overview</h4>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Avg Confidence:</span>
          <ConfidenceIndicator score={avgConfidence} size="small" />
        </div>
      </div>
      
      {/* Source Distribution Bar */}
      <div className="mb-3">
        <div className="flex h-8 rounded-lg overflow-hidden border-2 border-gray-300">
          {manualCount > 0 && (
            <div 
              className="bg-green-500 flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${manualPercent}%` }}
              title={`${manualCount} manual entries`}
            >
              {manualPercent > 15 && `${manualPercent.toFixed(0)}%`}
            </div>
          )}
          {voiceCount > 0 && (
            <div 
              className="bg-purple-500 flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${voicePercent}%` }}
              title={`${voiceCount} voice entries`}
            >
              {voicePercent > 15 && `${voicePercent.toFixed(0)}%`}
            </div>
          )}
          {ocrCount > 0 && (
            <div 
              className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${ocrPercent}%` }}
              title={`${ocrCount} OCR entries`}
            >
              {ocrPercent > 15 && `${ocrPercent.toFixed(0)}%`}
            </div>
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {manualCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-700">
              <span className="font-semibold">Manual:</span> {manualCount} ({manualPercent.toFixed(0)}%)
            </span>
          </div>
        )}
        {voiceCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-gray-700">
              <span className="font-semibold">Voice:</span> {voiceCount} ({voicePercent.toFixed(0)}%)
            </span>
          </div>
        )}
        {ocrCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-700">
              <span className="font-semibold">OCR:</span> {ocrCount} ({ocrPercent.toFixed(0)}%)
            </span>
          </div>
        )}
      </div>
      
      {/* Quality Assessment */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className={`text-sm p-2 rounded ${
          avgConfidence >= 0.9 ? 'bg-green-50 text-green-800' :
          avgConfidence >= 0.7 ? 'bg-blue-50 text-blue-800' :
          avgConfidence >= 0.5 ? 'bg-yellow-50 text-yellow-800' :
          'bg-red-50 text-red-800'
        }`}>
          {avgConfidence >= 0.9 && '✅ Excellent data quality - all entries reliable'}
          {avgConfidence >= 0.7 && avgConfidence < 0.9 && '👍 Good data quality - most entries verified'}
          {avgConfidence >= 0.5 && avgConfidence < 0.7 && '⚠️ Moderate data quality - some entries need verification'}
          {avgConfidence < 0.5 && '⚠️ Low data quality - manual verification recommended'}
        </div>
      </div>
    </div>
  );
};

const ConfidenceVisualization = {
  ConfidenceIndicator,
  SourceBadge,
  TrustIndicator,
  DataQualityBar
};

export default ConfidenceVisualization;
export { ConfidenceIndicator, SourceBadge, TrustIndicator, DataQualityBar };
