import React, { useState } from 'react';
import CalculatorWithVoice from './components/raj/CalculatorWithVoice';
import ProductList from './components/raj/ProductList';
import DailySummary from './components/tina/DailySummary';
import OCRScanner from './components/shashwat/OCRScanner';
import { addTransaction } from './services/api';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('billing');
  const [currentBill, setCurrentBill] = useState([]);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [showOCR, setShowOCR] = useState(false);

  const handleAddItem = (item) => {
    console.log('Adding item to bill:', item);
    const newItem = {
      id: Date.now() + Math.random(),
      product: item.product_name || item.product,
      quantity: item.quantity || 1,
      price: item.price || 0
    };
    setCurrentBill([...currentBill, newItem]);
  };

  const handleVoiceTransaction = (result) => {
    console.log('Voice transaction processed:', result);
  };

  const handleVoiceItemsExtracted = (items, payment) => {
    console.log('Voice/OCR items extracted:', items);
    
    // Safety check
    if (!items || !Array.isArray(items)) {
      console.error('Invalid items:', items);
      alert('⚠️ Error: Invalid items format');
      return;
    }
    
    if (items.length === 0) {
      return;
    }
    
    items.forEach(item => {
      handleAddItem(item);
    });
    
    if (payment) {
      setPaymentMode(payment);
    }
  };

  // Handle OCR extracted items - FIXED FORMAT
  const handleOCRExtraction = (items, payment) => {
    console.log('OCR Data extracted:', items);
    
    // Safety check
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('Invalid OCR data:', items);
      alert('⚠️ No items extracted from OCR');
      return;
    }
    
    // Add all OCR items to current bill
    items.forEach(item => {
      const newItem = {
        id: Date.now() + Math.random(),
        product: item.product_name || item.name || 'Unknown',
        quantity: item.quantity || 1,
        price: item.price || item.rate || 0,
        source: 'ocr',
        confidence: Math.round((item.confidence || 0.85) * 100)
      };
      setCurrentBill(prevBill => [...prevBill, newItem]);
    });
    
    // Hide OCR panel after extraction
    setShowOCR(false);
    
    // Show success notification
    const itemCount = items.length;
    const total = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    alert(`✅ OCR Success!\n\n${itemCount} item${itemCount !== 1 ? 's' : ''} added to bill\nTotal: ₹${total.toFixed(2)}`);
  };

  const handleRemoveItem = (id) => {
    setCurrentBill(currentBill.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return currentBill.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  };

  const handleCheckout = async (mode) => {
    if (currentBill.length === 0) {
      alert('⚠️ Please add items to the bill first!');
      return;
    }

    const total = calculateTotal();
    const transaction = {
      items: currentBill.map(item => ({
        product_name: item.product,
        quantity: item.quantity,
        price: item.price
      })),
      payment_mode: mode,
      total_amount: total,
      source: 'manual'
    };

    try {
      const result = await addTransaction(transaction);
      if (result.success) {
        alert(`✅ Transaction Saved!\n\nTotal: ₹${total.toFixed(2)}\nPayment: ${mode.toUpperCase()}\nItems: ${currentBill.length}`);
        setCurrentBill([]);
        setPaymentMode('cash');
      } else {
        alert('❌ Failed to save: ' + result.error);
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-4xl font-bold flex items-center justify-center sm:justify-start gap-3">
                <span>📱</span>
                <span>KhataSnap</span>
              </h1>
              <p className="text-blue-100 text-sm sm:text-base mt-2">
                AI-Powered Voice Billing for Small Businesses
              </p>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-xs sm:text-sm text-blue-100">Team Project 2026</div>
              <div className="text-xs text-blue-200 mt-1">
                Raj • Rizvan • Shashwat • Tina • Suryansh
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('billing')}
              className={`flex-shrink-0 px-6 py-4 font-semibold border-b-4 transition-all whitespace-nowrap ${
                activeTab === 'billing'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl mr-2">🎤</span>
              Voice Billing
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-shrink-0 px-6 py-4 font-semibold border-b-4 transition-all whitespace-nowrap ${
                activeTab === 'products'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl mr-2">📦</span>
              Inventory
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-shrink-0 px-6 py-4 font-semibold border-b-4 transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl mr-2">📊</span>
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'billing' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left - Calculator with Expandable Voice + OCR */}
            <div className="lg:col-span-2">
              {/* OCR Toggle Button */}
              <div className="mb-4">
                <button
                  onClick={() => setShowOCR(!showOCR)}
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg ${
                    showOCR
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                  }`}
                >
                  <span className="text-2xl mr-2">📸</span>
                  {showOCR ? 'Hide Receipt Scanner' : 'Scan Receipt (OCR)'}
                </button>
              </div>

              {/* OCR Scanner Component */}
              {showOCR && (
                <div className="mb-6 animate-fadeIn">
                  <OCRScanner onItemsExtracted={handleOCRExtraction} />
                </div>
              )}

              {/* Calculator with Voice */}
              <CalculatorWithVoice 
                onAddItem={handleAddItem}
                onItemsExtracted={handleVoiceItemsExtracted}
              />
            </div>

            {/* Right - Current Bill */}
            <div>
              <div className="card sticky top-24 shadow-2xl border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Current Bill</h2>
                  {currentBill.length > 0 && (
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow">
                      {currentBill.length} items
                    </span>
                  )}
                </div>
                
                {currentBill.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-8xl mb-4">🛒</div>
                    <p className="text-gray-400 text-xl font-semibold">No items yet</p>
                    <p className="text-sm text-gray-400 mt-3">
                      Use voice input or scan receipt
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                      {currentBill.map((item) => (
                        <div
                          key={item.id}
                          className="bg-gradient-to-r from-white to-gray-50 rounded-xl border-2 border-gray-200 p-4 hover:shadow-lg transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="font-bold text-lg text-gray-800">{item.product}</div>
                                {item.source === 'ocr' && (
                                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-semibold">
                                    OCR {item.confidence}%
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 mt-1.5">
                                {item.quantity} × ₹{item.price.toFixed(2)} = 
                                <span className="font-bold text-blue-600 ml-2 text-base">
                                  ₹{(item.quantity * item.price).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="ml-4 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-all"
                              title="Remove item"
                            >
                              <span className="text-2xl">✕</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t-2 border-gray-300 pt-6 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl font-bold text-gray-700">Total:</span>
                        <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          ₹{calculateTotal().toFixed(2)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 text-right">
                        {currentBill.length} item{currentBill.length !== 1 ? 's' : ''}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button 
                        onClick={() => handleCheckout('cash')}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-xl"
                      >
                        <span className="text-3xl">💵</span>
                        <span className="text-lg">Pay Cash</span>
                      </button>
                      <button 
                        onClick={() => handleCheckout('upi')}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-xl"
                      >
                        <span className="text-3xl">📱</span>
                        <span className="text-lg">Pay UPI</span>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Clear all items from bill?')) {
                            setCurrentBill([]);
                          }
                        }}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all"
                      >
                        🗑️ Clear Bill
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <ProductList />
        )}

        {activeTab === 'dashboard' && (
          <DailySummary />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white mt-20 border-t-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <p className="font-bold text-xl mb-3">Team KhataSnap © 2026</p>
            <p className="text-gray-400 text-sm mb-4">
              Voice-Powered Billing Solution for Small Businesses
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <span className="text-blue-400">👨‍💻</span>
                <span>Raj - Input Layer</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-green-400">👨‍💻</span>
                <span>Rizvan - Backend</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-purple-400">👨‍💻</span>
                <span>Shashwat - AI Layer</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-pink-400">👩‍💻</span>
                <span>Tina - Dashboard</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-yellow-400">👨‍💻</span>
                <span>Suryansh - Integration</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
