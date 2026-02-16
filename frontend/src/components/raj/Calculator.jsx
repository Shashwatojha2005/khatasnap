import React, { useState } from 'react';

const Calculator = ({ onAddItem }) => {
  const [display, setDisplay] = useState('0');
  const [currentValue, setCurrentValue] = useState('');
  const [operator, setOperator] = useState(null);
  const [previousValue, setPreviousValue] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');

  const handleNumber = (num) => {
    if (display === '0' || display === 'Error') {
      setDisplay(num);
      setCurrentValue(num);
    } else {
      const newValue = display + num;
      setDisplay(newValue);
      setCurrentValue(newValue);
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
    const amount = parseFloat(currentValue || display);
    
    if (isNaN(amount) || amount <= 0) {
      alert('⚠️ Please enter a valid amount!');
      return;
    }

    onAddItem({
      product_name: `Manual Entry`,
      quantity: 1,
      price: amount
    });

    alert(`✅ Added ₹${amount.toFixed(2)} to bill!`);
    handleClear();
  };

  return (
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

      {/* Speak Sale Button - Links to Voice Component */}
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
        <button 
          onClick={() => alert('Voice input available in the Voice Billing section above! 🎤')}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg transform hover:scale-105"
        >
          <span className="text-xl">🎤</span>
          <span>Use Voice Input Above</span>
        </button>
        <p className="text-xs text-gray-600 text-center mt-2">
          💡 Scroll up to use AI voice billing
        </p>
      </div>

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
        {/* Row 1 */}
        <button
          onClick={() => handleNumber('7')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95"
        >
          7
        </button>
        <button
          onClick={() => handleNumber('8')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95"
        >
          8
        </button>
        <button
          onClick={() => handleNumber('9')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95"
        >
          9
        </button>
        <button
          onClick={() => handleOperator('/')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95"
        >
          /
        </button>

        {/* Row 2 */}
        <button
          onClick={() => handleNumber('4')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95"
        >
          4
        </button>
        <button
          onClick={() => handleNumber('5')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95"
        >
          5
        </button>
        <button
          onClick={() => handleNumber('6')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95"
        >
          6
        </button>
        <button
          onClick={() => handleOperator('*')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95"
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          onClick={() => handleNumber('1')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95"
        >
          1
        </button>
        <button
          onClick={() => handleNumber('2')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95"
        >
          2
        </button>
        <button
          onClick={() => handleNumber('3')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95"
        >
          3
        </button>
        <button
          onClick={() => handleOperator('-')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95"
        >
          −
        </button>

        {/* Row 4 */}
        <button
          onClick={() => handleNumber('0')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95"
        >
          0
        </button>
        <button
          onClick={() => handleNumber('.')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95"
        >
          .
        </button>
        <button
          onClick={() => handleOperator('+')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95"
        >
          +
        </button>
        <button
          onClick={handleBackspace}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl py-4 rounded-lg shadow transition-all active:scale-95"
        >
          ⌫
        </button>

        {/* Row 5 */}
        <button
          onClick={handleEquals}
          className="col-span-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-lg shadow transition-all active:scale-95"
        >
          =
        </button>
        <button
          onClick={handleClear}
          className="col-span-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl py-4 rounded-lg shadow transition-all active:scale-95"
        >
          C
        </button>
      </div>

      {/* Add to Bill Button */}
      <button
        onClick={handleAddToCart}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-4 px-6 rounded-lg transition-all shadow-lg transform hover:scale-105"
      >
        Add to Bill
      </button>

      {/* Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        💡 Enter amount → Calculate if needed → Add to Bill
      </div>
    </div>
  );
};

export default Calculator;
