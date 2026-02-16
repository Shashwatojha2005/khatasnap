import React, { useState, useEffect } from 'react';
import VoiceInput from '../shashwat/VoiceInput';

const CalculatorWithVoice = ({ onAddItem, onItemsExtracted }) => {
  const [display, setDisplay] = useState('0');
  const [currentValue, setCurrentValue] = useState('');
  const [operator, setOperator] = useState(null);
  const [previousValue, setPreviousValue] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [recentSales, setRecentSales] = useState([]);

  // Load recent sales from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('recentSales');
    if (saved) {
      setRecentSales(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever recentSales changes
  useEffect(() => {
    localStorage.setItem('recentSales', JSON.stringify(recentSales));
  }, [recentSales]);

  const addToRecentSales = (amount, mode, calculation = '') => {
    const sale = {
      id: Date.now(),
      amount: amount,
      paymentMode: mode,
      calculation: calculation,
      timestamp: new Date().toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
    
    setRecentSales([sale, ...recentSales].slice(0, 20)); // Keep last 20
  };

  const handleNumber = (num) => {
    if (display === '0' || display === 'Error') {
      setDisplay(num);
      setCurrentValue(num);
    } else {
      // Check if we just pressed an operator (currentValue is empty but display is not)
      if (currentValue === '' && operator) {
        // Start fresh after operator
        setDisplay(display + num);
        setCurrentValue(num);
      } else {
        // Normal number entry
        setDisplay(display + num);
        setCurrentValue(currentValue + num);
      }
    }
  };

  const handleOperator = (op) => {
    if (currentValue) {
      setPreviousValue(currentValue);
      setOperator(op);
      setDisplay(display + ' ' + op + ' ');
      setCurrentValue('');
    }
  };

  const handleEquals = () => {
    if (previousValue && currentValue && operator) {
      const prev = parseFloat(previousValue);
      const curr = parseFloat(currentValue);
      let result = 0;

      switch (operator) {
        case '+':
          result = prev + curr;
          break;
        case '-':
          result = prev - curr;
          break;
        case '*':
          result = prev * curr;
          break;
        case '/':
          result = curr !== 0 ? prev / curr : 'Error';
          break;
        default:
          return;
      }

      setDisplay(result.toString());
      setCurrentValue(result.toString());
      setPreviousValue('');
      setOperator(null);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setCurrentValue('');
    setPreviousValue('');
    setOperator(null);
  };

  const handleBackspace = () => {
    if (display.length > 1 && display !== 'Error') {
      const newDisplay = display.slice(0, -1);
      setDisplay(newDisplay);
      setCurrentValue(newDisplay);
    } else {
      setDisplay('0');
      setCurrentValue('');
    }
  };

  const handleAddToCart = () => {
    console.log('=== ADD TO CART DEBUG ===');
    console.log('Display:', display);
    console.log('Current Value:', currentValue, typeof currentValue);
    console.log('Previous Value:', previousValue, typeof previousValue);
    console.log('Operator:', operator);
    
    let finalAmount = parseFloat(currentValue || display);
    let calculationString = display;
    
    console.log('Initial finalAmount:', finalAmount);
    
    // If there's a pending operation, calculate it first
    if (previousValue && currentValue && operator) {
      const prev = parseFloat(previousValue);
      const curr = parseFloat(currentValue);
      
      console.log('Pending operation detected:');
      console.log('  Previous:', prev, typeof prev);
      console.log('  Current:', curr, typeof curr);
      console.log('  Operator:', operator);
      
      switch (operator) {
        case '+':
          finalAmount = prev + curr;
          console.log('  Addition result:', finalAmount);
          break;
        case '-':
          finalAmount = prev - curr;
          console.log('  Subtraction result:', finalAmount);
          break;
        case '*':
          finalAmount = prev * curr;
          console.log('  Multiplication result:', finalAmount);
          break;
        case '/':
          finalAmount = curr !== 0 ? prev / curr : 0;
          console.log('  Division result:', finalAmount);
          break;
        default:
          finalAmount = curr;
          console.log('  Default, using current:', finalAmount);
      }
      
      calculationString = display; // Keep the full calculation string
    }
    
    console.log('Final amount to add:', finalAmount);
    console.log('Calculation string:', calculationString);
    
    if (isNaN(finalAmount) || finalAmount <= 0) {
      console.log('❌ Invalid amount');
      alert('⚠️ Please enter a valid amount!');
      return;
    }

    onAddItem({
      product_name: `Manual Entry`,
      quantity: 1,
      price: finalAmount
    });

    // Add to recent sales with the calculation shown
    addToRecentSales(finalAmount, paymentMode, calculationString !== finalAmount.toString() ? calculationString : '');

    alert(`✅ Added ₹${finalAmount.toFixed(2)} to bill!`);
    handleClear();
  };

  const handleVoiceComplete = (items, payment) => {
    // Calculate total from voice items
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    addToRecentSales(total, payment || 'cash', 'Voice');
    
    setShowVoiceModal(false);
    handleClear();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calculator - Left Side */}
      <div className="lg:col-span-2">
        <div className="card max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🧾</span>
            <h2 className="text-xl font-bold">Smart Sale</h2>
          </div>

          {/* Display */}
          <div className="mb-4">
            <input
              type="text"
              value={display}
              readOnly
              className="w-full text-right text-3xl font-bold px-4 py-3 border-2 border-gray-300 rounded-lg bg-white"
            />
          </div>

          {/* Voice Button */}
          <button 
            onClick={() => setShowVoiceModal(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg mb-4 flex items-center justify-center gap-2 transition-all shadow-lg transform hover:scale-105"
          >
            <span className="text-xl">🎤</span>
            <span>Use Voice Input</span>
            <span className="text-sm ml-2">▲</span>
          </button>

          {/* Payment Mode */}
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => setPaymentMode('cash')}
              className={`flex-1 font-bold py-3 px-4 rounded-lg transition-all shadow ${
                paymentMode === 'cash'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Cash
            </button>
            <button 
              onClick={() => setPaymentMode('upi')}
              className={`flex-1 font-bold py-3 px-4 rounded-lg transition-all shadow ${
                paymentMode === 'upi'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              UPI
            </button>
          </div>

          {/* Calculator Grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <button onClick={() => handleNumber('7')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95">7</button>
            <button onClick={() => handleNumber('8')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95">8</button>
            <button onClick={() => handleNumber('9')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95">9</button>
            <button onClick={() => handleOperator('/')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95">/</button>

            <button onClick={() => handleNumber('4')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95">4</button>
            <button onClick={() => handleNumber('5')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95">5</button>
            <button onClick={() => handleNumber('6')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95">6</button>
            <button onClick={() => handleOperator('*')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95">×</button>

            <button onClick={() => handleNumber('1')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95">1</button>
            <button onClick={() => handleNumber('2')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95">2</button>
            <button onClick={() => handleNumber('3')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95">3</button>
            <button onClick={() => handleOperator('-')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95">−</button>

            <button onClick={() => handleNumber('0')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95">0</button>
            <button onClick={() => handleNumber('.')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95">.</button>
            <button onClick={() => handleOperator('+')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95">+</button>
            <button onClick={handleBackspace} className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl py-4 rounded-lg shadow transition-all active:scale-95">⌫</button>

            <button onClick={handleEquals} className="col-span-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95">=</button>
            <button onClick={handleClear} className="col-span-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl py-4 rounded-lg shadow transition-all active:scale-95">C</button>
          </div>

          {/* Add to Bill Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-4 px-6 rounded-lg transition-all shadow-lg transform hover:scale-105"
          >
            Add to Bill
          </button>

          <div className="mt-4 text-xs text-gray-500 text-center">
            💡 Enter amount → Calculate → Add | Click 🎤 for voice
          </div>
        </div>
      </div>

      {/* Recent Sales - Right Side */}
      <div className="lg:col-span-1">
        <div className="card sticky top-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span>Recent Sales</span>
            </h3>
            <button 
              className="text-gray-400 hover:text-blue-600"
              onClick={() => window.location.href = '#'}
            >
              →
            </button>
          </div>

          {recentSales.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">📋</div>
              <p>No sales yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {recentSales.map((sale) => (
                <div 
                  key={sale.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-2xl font-bold text-gray-800">
                      ₹ {sale.amount.toFixed(0)}
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      sale.paymentMode === 'cash' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {sale.paymentMode}
                    </span>
                  </div>
                  
                  {sale.calculation && sale.calculation !== sale.amount.toString() && (
                    <div className="text-sm text-gray-600 mb-1">
                      {sale.calculation}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    {sale.timestamp}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Voice Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <span className="text-3xl">🎤</span>
                  <span>Voice Input</span>
                </h3>
                <button
                  onClick={() => setShowVoiceModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <span className="text-3xl font-bold">×</span>
                </button>
              </div>
              <p className="text-green-100 text-sm mt-2">
                Speak naturally - AI will understand and add items to your bill
              </p>
            </div>

            <div className="p-6">
              <VoiceInput 
                onTransactionProcessed={() => {}}
                onItemsExtracted={(items, payment) => {
                  onItemsExtracted(items, payment);
                  handleVoiceComplete(items, payment);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculatorWithVoice;
