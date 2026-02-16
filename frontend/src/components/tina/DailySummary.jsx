import React, { useState, useEffect } from 'react';
import { getDailySummary } from '../../services/api';

const DailySummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    fetchSummary();
  }, [selectedDate]);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getDailySummary(selectedDate);
      
      if (result.success) {
        setSummary(result.data);
      } else {
        setError(result.error || 'Failed to load summary');
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to connect to server');
    }
    
    setLoading(false);
  };

  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="text-5xl mb-4">⏳</div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-600 font-semibold">{error}</p>
          <button 
            onClick={fetchSummary}
            className="btn btn-primary mt-4"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalRevenue = (summary?.cash?.total || 0) + (summary?.upi?.total || 0);
  const totalTransactions = summary?.total_transactions || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">📊 Daily Analytics</h2>
            <p className="text-gray-600 mt-1">{formatDate(selectedDate)}</p>
          </div>
          
          <div className="flex gap-2">
            <input
              type="date"
              value={selectedDate}
              max={getToday()}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input"
            />
            <button
              onClick={() => setSelectedDate(getToday())}
              className="btn btn-secondary"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="text-sm opacity-90 mb-2">Total Revenue</div>
          <div className="text-4xl font-bold mb-2">
            ₹{totalRevenue.toFixed(2)}
          </div>
          <div className="text-sm opacity-75">
            {totalTransactions} transaction{totalTransactions !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Cash */}
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="text-sm opacity-90 mb-2">💵 Cash</div>
          <div className="text-4xl font-bold mb-2">
            ₹{(summary?.cash?.total || 0).toFixed(2)}
          </div>
          <div className="text-sm opacity-75">
            {summary?.cash?.count || 0} transaction{summary?.cash?.count !== 1 ? 's' : ''}
          </div>
        </div>

        {/* UPI */}
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="text-sm opacity-90 mb-2">📱 UPI</div>
          <div className="text-4xl font-bold mb-2">
            ₹{(summary?.upi?.total || 0).toFixed(2)}
          </div>
          <div className="text-sm opacity-75">
            {summary?.upi?.count || 0} transaction{summary?.upi?.count !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {totalTransactions > 0 ? (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
          
          <div className="space-y-3">
            {/* Cash Transactions */}
            {summary?.cash?.transactions?.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-700 mb-2">💵 Cash Payments</h4>
                {summary.cash.transactions.map((txn, index) => (
                  <div 
                    key={txn.id || index}
                    className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">
                          {new Date(txn.created_at).toLocaleTimeString('en-IN')}
                        </div>
                        <div className="mt-1">
                          {txn.items && txn.items.map((item, i) => (
                            <div key={i} className="text-sm">
                              • {item.quantity}x {item.product_name}
                            </div>
                          ))}
                        </div>
                        {txn.source && (
                          <div className="text-xs text-gray-500 mt-1">
                            Source: {txn.source}
                            {txn.confidence_score && (
                              <span className="ml-2">
                                ({(txn.confidence_score * 100).toFixed(0)}% confidence)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-lg font-bold text-green-700">
                        ₹{parseFloat(txn.total_amount || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* UPI Transactions */}
            {summary?.upi?.transactions?.length > 0 && (
              <div>
                <h4 className="font-semibold text-purple-700 mb-2 mt-4">📱 UPI Payments</h4>
                {summary.upi.transactions.map((txn, index) => (
                  <div 
                    key={txn.id || index}
                    className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">
                          {new Date(txn.created_at).toLocaleTimeString('en-IN')}
                        </div>
                        <div className="mt-1">
                          {txn.items && txn.items.map((item, i) => (
                            <div key={i} className="text-sm">
                              • {item.quantity}x {item.product_name}
                            </div>
                          ))}
                        </div>
                        {txn.source && (
                          <div className="text-xs text-gray-500 mt-1">
                            Source: {txn.source}
                            {txn.confidence_score && (
                              <span className="ml-2">
                                ({(txn.confidence_score * 100).toFixed(0)}% confidence)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-lg font-bold text-purple-700">
                        ₹{parseFloat(txn.total_amount || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg font-medium">No transactions yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Transactions will appear here once you start billing
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailySummary;
