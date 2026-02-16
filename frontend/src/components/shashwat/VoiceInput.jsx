import React, { useState, useEffect } from 'react';
import { processVoiceTransaction } from '../../services/api';

const VoiceInput = ({ onTransactionProcessed, onItemsExtracted }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    console.log('VoiceInput component mounted');
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-IN';
      
      recognitionInstance.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        console.log('Speech recognized:', transcriptText);
        setTranscript(transcriptText);
        setError(null);
      };
      
      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          setError('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
          setError('Microphone permission denied. Please enable it in browser settings.');
        } else {
          setError(`Error: ${event.error}. Please try again.`);
        }
      };
      
      setRecognition(recognitionInstance);
      console.log('Speech recognition initialized');
    } else {
      console.error('Speech recognition not supported');
    }
  }, []);

  const startListening = () => {
    console.log('Starting speech recognition...');
    if (recognition) {
      setTranscript('');
      setResult(null);
      setError(null);
      try {
        recognition.start();
        setIsListening(true);
        console.log('Speech recognition started successfully');
      } catch (err) {
        console.error('Error starting recognition:', err);
        setError('Failed to start microphone. Please try again.');
      }
    } else {
      console.error('Recognition not available');
      setError('Speech recognition not available');
    }
  };

  const stopListening = () => {
    console.log('Stopping speech recognition...');
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleProcessVoice = async () => {
    console.log('=== STARTING VOICE PROCESSING ===');
    console.log('Transcript:', transcript);
    
    if (!transcript.trim()) {
      console.error('No transcript to process');
      setError('No speech detected. Please try again.');
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      console.log('Calling processVoiceTransaction API...');
      const response = await processVoiceTransaction(transcript);
      
      console.log('Voice processing response:', response);
      
      if (response.success) {
        setResult(response);
        console.log('Processing successful!');
        
        if (response.auto_saved) {
          console.log('Transaction was auto-saved');
          
          if (onItemsExtracted && response.ai_analysis && response.ai_analysis.items) {
            console.log('Calling onItemsExtracted with items:', response.ai_analysis.items);
            onItemsExtracted(response.ai_analysis.items, response.ai_analysis.payment_mode);
          } else {
            console.warn('onItemsExtracted callback not provided or no items');
          }
          
          setTimeout(() => {
            console.log('Clearing result...');
            setTranscript('');
            setResult(null);
          }, 3000);
        } else if (response.requires_review) {
          console.log('Low confidence - requires review');
          const confidence = response.ai_analysis ? response.ai_analysis.total_confidence : 0;
          setError(`Low confidence (${(confidence * 100).toFixed(0)}%). Please speak more clearly.`);
        }
        
        if (onTransactionProcessed) {
          console.log('Calling onTransactionProcessed callback');
          onTransactionProcessed(response);
        }
      } else {
        console.error('Processing failed:', response.error);
        setError(response.error || 'Failed to process voice input');
      }
    } catch (err) {
      console.error('Voice processing error:', err);
      setError('Failed to process. Check console and backend logs.');
    } finally {
      setProcessing(false);
      console.log('=== VOICE PROCESSING COMPLETE ===');
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceBg = (confidence) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">🎤 Voice Input</h2>
      
      <div className="bg-gray-100 rounded-lg p-4 mb-4 min-h-24">
        {transcript ? (
          <div>
            <p className="text-lg font-medium">{transcript}</p>
            {processing && (
              <p className="text-sm text-blue-600 mt-2 animate-pulse">
                ⏳ Processing with AI... Please wait...
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-400 italic">
            {isListening ? '🎙️ Listening... Speak now!' : 'Click microphone to start speaking...'}
          </p>
        )}
      </div>

      {result && result.ai_analysis && (
        <div className="mb-4 space-y-3">
          <div className={`p-3 rounded-lg ${getConfidenceColor(result.ai_analysis.total_confidence)}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">AI Confidence</span>
              <span className="text-lg font-bold">
                {(result.ai_analysis.total_confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getConfidenceBg(result.ai_analysis.total_confidence)}`}
                style={{ width: `${result.ai_analysis.total_confidence * 100}%` }}
              />
            </div>
          </div>

          {result.auto_saved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-2xl">✅</span>
                <div className="flex-1">
                  <div className="font-semibold text-green-800">Transaction Saved!</div>
                  <div className="text-sm text-green-600 mt-1">
                    {result.ai_analysis.items.length} item(s) • {result.ai_analysis.payment_mode.toUpperCase()} • ₹{result.total_amount.toFixed(2)}
                  </div>
                  <div className="text-xs text-green-600 mt-2">
                    {result.ai_analysis.items.map((item, idx) => (
                      <div key={idx}>• {item.quantity}x {item.product_name}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {result.requires_review && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div className="font-semibold text-yellow-800">Low Confidence - Please Retry</div>
                  <div className="text-sm text-yellow-600">
                    Try speaking more clearly or slowly
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="text-xl">❌</span>
            <div className="text-sm text-red-600">{error}</div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {!isListening && !processing ? (
          <>
            <button
              onClick={startListening}
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={!recognition}
            >
              🎤 Start Speaking
            </button>
            {transcript && (
              <button
                onClick={handleProcessVoice}
                className="btn btn-success flex-1 flex items-center justify-center gap-2"
              >
                ✨ Process
              </button>
            )}
          </>
        ) : isListening ? (
          <button
            onClick={stopListening}
            className="btn bg-red-500 text-white hover:bg-red-600 flex-1 animate-pulse"
          >
            ⏹️ Stop Recording
          </button>
        ) : (
          <button
            className="btn btn-secondary flex-1"
            disabled
          >
            ⏳ Processing...
          </button>
        )}
      </div>

      {!recognition && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg text-sm">
          ⚠️ Voice recognition not supported in this browser. Please use Chrome or Edge.
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p><strong>How to use:</strong></p>
        <p>1. Click "🎤 Start Speaking"</p>
        <p>2. Say: "2 Parle G and 1 Maggi UPI"</p>
        <p>3. Click "⏹️ Stop Recording"</p>
        <p>4. Click "✨ Process" to send to AI</p>
      </div>
    </div>
  );
};

export default VoiceInput;
