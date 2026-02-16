import React, { useState } from 'react';
import VoiceInput from '../shashwat/VoiceInput';
import Calculator from './Calculator';
import OCRScanner from '../shashwat/OCRScanner';

const InputTabs = ({ onAddItem, onItemsExtracted }) => {
  const [activeInput, setActiveInput] = useState('voice');

  return (
    <div className="card p-0 overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b-2 border-gray-200 bg-gray-50">
        <button
          onClick={() => setActiveInput('voice')}
          className={`flex-1 py-4 px-6 font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            activeInput === 'voice'
              ? 'bg-white border-b-4 border-blue-600 text-blue-600 -mb-0.5'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <span className="text-2xl">🎤</span>
          <span>Voice</span>
        </button>
        
        <button
          onClick={() => setActiveInput('calculator')}
          className={`flex-1 py-4 px-6 font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            activeInput === 'calculator'
              ? 'bg-white border-b-4 border-blue-600 text-blue-600 -mb-0.5'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <span className="text-2xl">🧮</span>
          <span>Calculator</span>
        </button>
        
        <button
          onClick={() => setActiveInput('ocr')}
          className={`flex-1 py-4 px-6 font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            activeInput === 'ocr'
              ? 'bg-white border-b-4 border-blue-600 text-blue-600 -mb-0.5'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <span className="text-2xl">📸</span>
          <span>OCR</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeInput === 'voice' && (
          <div className="animate-fadeIn">
            <VoiceInput 
              onTransactionProcessed={() => {}}
              onItemsExtracted={onItemsExtracted}
            />
          </div>
        )}

        {activeInput === 'calculator' && (
          <div className="animate-fadeIn">
            <Calculator onAddItem={onAddItem} />
          </div>
        )}

        {activeInput === 'ocr' && (
          <div className="animate-fadeIn">
            <OCRScanner onItemsExtracted={onItemsExtracted} />
          </div>
        )}
      </div>
    </div>
  );
};

export default InputTabs;
