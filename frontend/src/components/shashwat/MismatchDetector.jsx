import React, { useState } from 'react';
import { detectMismatch } from '../../services/api';

const MismatchDetector = ({ expected, actual, onClose }) => {
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState(null);

  const checkMismatch = async () => {
    setDetecting(true);
    
    try {
      const response = await detectMismatch(expected, actual);
      
      if (response.success) {
        setResult(response.data);
      } else {
        setResult({
          has_mismatch: false,
          error: 'Failed to detect mismatch'
        });
      }
    } catch (error) {
      console.error('Mismatch detection error:', error);
      setResult({
        has_mismatch: false,
        error: 'Detection failed'
      });
    }
    
    setDetecting(false);
  };

  React.useEffect(() => {
    if (expected && actual) {
      checkMismatch();
    }
  }, [expected, actual]);

  if (detecting) {
    return (
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin text-2xl">🔄</div>
          <div>
            <div className="font-bold text-blue-900">Checking for mismatches...</div>
            <div className="text-sm text-blue-700">AI analyzing transaction</div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  if (result.error) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-bold text-yellow-900">Mismatch Check Failed</div>
              <div className="text-sm text-yellow-700">{result.error}</div>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-yellow-700 hover:text-yellow-900">
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!result.has_mismatch) {
    return (
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✅</span>
            <div>
              <div className="font-bold text-green-900">No Mismatch Detected</div>
              <div className="text-sm text-green-700">
                Transaction appears correct
                {result.confidence && (
                  <span className="ml-2">
                    ({(result.confidence * 100).toFixed(0)}% confidence)
                  </span>
                )}
              </div>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-green-700 hover:text-green-900">
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }

  // Mismatch detected
  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <span className="text-3xl">⚠️</span>
          <div>
            <div className="font-bold text-red-900 text-lg">Mismatch Detected!</div>
            <div className="text-sm text-red-700">
              {result.suggestion || 'Please verify the transaction details'}
            </div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-red-700 hover:text-red-900">
            ✕
          </button>
        )}
      </div>

      {result.mismatches && result.mismatches.length > 0 && (
        <div className="mt-3 space-y-2">
          {result.mismatches.map((mismatch, index) => (
            <div 
              key={index}
              className={`bg-white rounded-lg p-3 border-2 ${
                mismatch.severity === 'high' ? 'border-red-400' :
                mismatch.severity === 'medium' ? 'border-yellow-400' :
                'border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 capitalize">
                    {mismatch.field.replace(/_/g, ' ')}
                  </div>
                  <div className="mt-1 text-sm">
                    <div className="text-gray-600">
                      Expected: <span className="font-semibold text-gray-900">{mismatch.expected_value}</span>
                    </div>
                    <div className="text-red-600">
                      Actual: <span className="font-semibold text-red-900">{mismatch.actual_value}</span>
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  mismatch.severity === 'high' ? 'bg-red-200 text-red-900' :
                  mismatch.severity === 'medium' ? 'bg-yellow-200 text-yellow-900' :
                  'bg-gray-200 text-gray-900'
                }`}>
                  {mismatch.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {result.confidence && (
        <div className="mt-3 pt-3 border-t border-red-200">
          <div className="text-xs text-red-700">
            Detection confidence: {(result.confidence * 100).toFixed(0)}%
          </div>
        </div>
      )}
    </div>
  );
};

export default MismatchDetector;
