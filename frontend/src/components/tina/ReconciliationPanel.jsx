import React, { useState } from 'react';
import MismatchDetector from '../shashwat/MismatchDetector';

const ReconciliationPanel = ({ summary }) => {
  const [actualCash, setActualCash] = useState('');
  const [actualUPI, setActualUPI] = useState('');
  const [isReconciled, setIsReconciled] = useState(false);
  const [showMismatch, setShowMismatch] = useState(false);

  const expectedCash = summary?.cash?.total || 0;
  const expectedUPI = summary?.upi?.total || 0;
  const expectedTotal = expectedCash + expectedUPI;

  const actualCashNum = parseFloat(actualCash) || 0;
  const actualUPINum = parseFloat(actualUPI) || 0;
  const actualTotal = actualCashNum + actualUPINum;

  const cashDiff = actualCashNum - expectedCash;
  const upiDiff = actualUPINum - expectedUPI;
  const totalDiff = actualTotal - expectedTotal;

  const hasMismatch = Math.abs(totalDiff) > 0.5;

  const handleReconcile = () => {
    if (!actualCash && !actualUPI) {
      alert('⚠️ Please enter actual cash and UPI amounts');
      return;
    }

    if (hasMismatch) {
      setShowMismatch(true);
    } else {
      setIsReconciled(true);
      setTimeout(() => {
        alert('✅ Reconciliation Complete!\n\nAll amounts match. Day closed successfully.');
      }, 300);
    }
  };

  const handleReset = () => {
    setActualCash('');
    setActualUPI('');
    setIsReconciled(false);
    setShowMismatch(false);
  };

  return (
    <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-purple-900">💰 Daily Reconciliation</h3>
          <p className="text-sm text-purple-700 mt-1">
            Verify actual cash & UPI collected vs system records
          </p>
        </div>
        {isReconciled && (
          <span className="bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
            ✓ RECONCILED
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Expected (System) */}
        <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
          <div className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
            <span>💻</span>
            <span>SYSTEM RECORDS (Expected)</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700 font-medium">💵 Cash</span>
              <span className="text-xl font-bold text-green-700">
                ₹{expectedCash.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-gray-700 font-medium">📱 UPI</span>
              <span className="text-xl font-bold text-purple-700">
                ₹{expectedUPI.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-2 border-blue-300">
              <span className="text-gray-800 font-bold">Total</span>
              <span className="text-2xl font-bold text-blue-700">
                ₹{expectedTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Actual (Manual Count) */}
        <div className="bg-white rounded-xl p-5 border-2 border-blue-300 shadow-sm">
          <div className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
            <span>👤</span>
            <span>ACTUAL COUNT (Manual)</span>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💵 Actual Cash
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                placeholder="Enter counted cash"
                className="input w-full text-lg font-semibold"
                disabled={isReconciled}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📱 Actual UPI
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={actualUPI}
                onChange={(e) => setActualUPI(e.target.value)}
                placeholder="Enter UPI total"
                className="input w-full text-lg font-semibold"
                disabled={isReconciled}
              />
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg border-2 border-gray-300">
              <span className="text-gray-800 font-bold">Total</span>
              <span className="text-2xl font-bold text-gray-800">
                ₹{actualTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Difference Summary */}
      {(actualCash || actualUPI) && (
        <div className="bg-white rounded-xl p-5 mb-6 border-2 border-gray-300">
          <h4 className="font-bold text-gray-800 mb-3">📊 Difference Analysis</h4>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${
              Math.abs(cashDiff) < 0.5 ? 'bg-green-50 border border-green-300' : 'bg-red-50 border border-red-300'
            }`}>
              <div className="text-sm text-gray-600 mb-1">Cash Difference</div>
              <div className={`text-2xl font-bold ${
                Math.abs(cashDiff) < 0.5 ? 'text-green-700' : 'text-red-700'
              }`}>
                {cashDiff >= 0 ? '+' : ''}₹{cashDiff.toFixed(2)}
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${
              Math.abs(upiDiff) < 0.5 ? 'bg-green-50 border border-green-300' : 'bg-red-50 border border-red-300'
            }`}>
              <div className="text-sm text-gray-600 mb-1">UPI Difference</div>
              <div className={`text-2xl font-bold ${
                Math.abs(upiDiff) < 0.5 ? 'text-green-700' : 'text-red-700'
              }`}>
                {upiDiff >= 0 ? '+' : ''}₹{upiDiff.toFixed(2)}
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${
              Math.abs(totalDiff) < 0.5 ? 'bg-green-50 border border-green-300' : 'bg-red-50 border border-red-300'
            }`}>
              <div className="text-sm text-gray-600 mb-1">Total Difference</div>
              <div className={`text-2xl font-bold ${
                Math.abs(totalDiff) < 0.5 ? 'text-green-700' : 'text-red-700'
              }`}>
                {totalDiff >= 0 ? '+' : ''}₹{totalDiff.toFixed(2)}
              </div>
            </div>
          </div>

          {hasMismatch && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-xl">⚠️</span>
                <div className="text-sm text-yellow-800">
                  <div className="font-bold">Mismatch Detected</div>
                  <div className="mt-1">
                    {totalDiff > 0 
                      ? `You have ₹${totalDiff.toFixed(2)} more than expected. Check for missing entries.`
                      : `You are short by ₹${Math.abs(totalDiff).toFixed(2)}. Verify all transactions were recorded.`
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mismatch Detection */}
      {showMismatch && (
        <div className="mb-6">
          <MismatchDetector
            expected={{
              total_amount: expectedTotal,
              cash: expectedCash,
              upi: expectedUPI
            }}
            actual={{
              total_amount: actualTotal,
              cash: actualCashNum,
              upi: actualUPINum
            }}
            onClose={() => setShowMismatch(false)}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!isReconciled ? (
          <>
            <button
              onClick={handleReconcile}
              disabled={!actualCash && !actualUPI}
              className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                actualCash || actualUPI
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {hasMismatch && (actualCash || actualUPI) ? '⚠️ Reconcile with Mismatch' : '✅ Reconcile & Close Day'}
            </button>
            {(actualCash || actualUPI) && (
              <button
                onClick={handleReset}
                className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all"
              >
                Reset
              </button>
            )}
          </>
        ) : (
          <button
            onClick={handleReset}
            className="flex-1 py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg rounded-xl transition-all"
          >
            📝 New Reconciliation
          </button>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <div className="font-semibold mb-1">💡 How to Reconcile:</div>
          <ol className="list-decimal list-inside space-y-1">
            <li>Count actual cash in drawer</li>
            <li>Check UPI app for total received</li>
            <li>Enter both amounts above</li>
            <li>System will verify and alert if mismatch</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ReconciliationPanel;
