import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

const OCRScanner = ({ onItemsExtracted }) => {
  const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedItems, setExtractedItems] = useState([]);
  const [rawText, setRawText] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  const [ocrQuality, setOcrQuality] = useState('unknown');

  // Sample receipt for demo
  const loadSampleReceipt = () => {
    // Create a canvas with a clean receipt
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    
    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 600, 800);
    
    // Receipt content
    ctx.fillStyle = 'black';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('KIRANA STORE', 300, 60);
    
    ctx.font = '20px Arial';
    ctx.fillText('Receipt #12345', 300, 100);
    ctx.fillText('Date: 15-Feb-2026', 300, 130);
    
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 150);
    ctx.lineTo(550, 150);
    ctx.stroke();
    
    // Items
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'left';
    
    const items = [
      { name: 'Parle G Biscuits', qty: '2x', price: '₹20.00' },
      { name: 'Maggi Noodles', qty: '3x', price: '₹36.00' },
      { name: 'Pepsi 500ml', qty: '1x', price: '₹40.00' },
      { name: 'Kurkure', qty: '2x', price: '₹40.00' },
      { name: 'Good Day', qty: '1x', price: '₹30.00' }
    ];
    
    let y = 200;
    items.forEach(item => {
      ctx.fillText(item.name, 60, y);
      ctx.fillText(item.qty, 380, y);
      ctx.fillText(item.price, 470, y);
      y += 60;
    });
    
    // Total
    ctx.beginPath();
    ctx.moveTo(50, y + 20);
    ctx.lineTo(550, y + 20);
    ctx.stroke();
    
    ctx.font = 'bold 32px Arial';
    ctx.fillText('TOTAL:', 60, y + 70);
    ctx.fillText('₹166.00', 450, y + 70);
    
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Thank you for shopping!', 300, y + 130);
    
    const dataUrl = canvas.toDataURL('image/png');
    setImage(dataUrl);
    setShowResults(false);
    setExtractedItems([]);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size
      if (file.size > 5000000) { // 5MB
        alert('⚠️ Image too large. Please use an image under 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setShowResults(false);
        setExtractedItems([]);
        setRawText('');
      };
      reader.readAsDataURL(file);
    }
  };

  const preprocessImage = async (imageData) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Convert to grayscale and enhance contrast
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          
          // Apply threshold (adaptive binarization)
          const threshold = gray > 128 ? 255 : 0;
          
          data[i] = threshold;
          data[i + 1] = threshold;
          data[i + 2] = threshold;
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL());
      };
      img.src = imageData;
    });
  };

  const parseReceiptText = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const items = [];
    
    // Keywords to skip (headers/footers)
    const skipKeywords = [
      'receipt', 'bill', 'invoice', 'store', 'shop', 'market', 'general',
      'address', 'phone', 'tel', 'email', 'website', 'road', 'delhi', 'mumbai',
      'date', 'time', 'bill no', 'receipt no', 'no:', 'pm', 'am',
      'subtotal', 'total', 'grand total', 'amount', 'sum',
      'payment', 'cash', 'card', 'upi', 'mode',
      'thank', 'visit', 'again', 'welcome', 'gst', 'tax'
    ];
    
    // Product name database for better matching
    const knownProducts = {
      'parle': 'Parle G',
      'maggi': 'Maggi',
      'pepsi': 'Pepsi',
      'coca': 'Coca Cola',
      'coke': 'Coca Cola',
      'kurkure': 'Kurkure',
      'lays': 'Lays',
      'good': 'Good Day',
      'day': 'Good Day',
      'britannia': 'Britannia',
      'marie': 'Britannia Marie',
      'oreo': 'Oreo',
      'dairy': 'Dairy Milk',
      'chocolate': 'Chocolate',
      'biscuit': 'Biscuit',
      'noodle': 'Noodles',
      'chips': 'Chips',
      'butter': 'Butter',
      'milk': 'Milk',
      'bread': 'Bread',
      'oil': 'Oil',
      'rice': 'Rice',
      'sugar': 'Sugar',
      'tea': 'Tea',
      'coffee': 'Coffee'
    };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lower = line.toLowerCase();
      
      // Skip empty or very short lines
      if (line.length < 3) continue;
      
      // Skip lines that are clearly headers/footers
      const isSkip = skipKeywords.some(keyword => lower.includes(keyword));
      if (isSkip) continue;
      
      // Skip lines that are only dashes, dots, equals
      if (line.match(/^[\-\.\=\*\_\s]+$/)) continue;
      
      // Skip lines that look like bill numbers (KS-1234, #1234, Bill: 1234)
      if (line.match(/^[A-Z]{2,}\-?\d+$/i)) continue;
      if (line.match(/^#\d+$/)) continue;
      if (line.match(/^bill\s*[:№#]\s*\d+/i)) continue;
      
      // Extract all numbers from the line
      const numbers = line.match(/\d+\.?\d*/g);
      if (!numbers || numbers.length === 0) continue;
      
      // Skip if line is ONLY a large number (likely bill number or date)
      if (numbers.length === 1 && parseFloat(numbers[0]) > 500 && !line.match(/[xX×]/)) {
        continue;
      }
      
      // Look for quantity patterns
      let quantity = 1;
      const qtyPatterns = [
        /(\d+)\s*[xX×]/,           // 2x, 2 x
        /[xX×]\s*(\d+)/,           // x2
        /(\d+)\s*qty/i,            // 2 qty
        /qty\s*[:\-]?\s*(\d+)/i    // qty: 2
      ];
      
      for (const pattern of qtyPatterns) {
        const match = line.match(pattern);
        if (match) {
          const qty = parseInt(match[1]);
          if (qty > 0 && qty <= 100) {
            quantity = qty;
          }
          break;
        }
      }
      
      // Extract prices (last one or two numbers on line)
      let price = 0;
      let total = 0;
      
      if (numbers.length >= 2) {
        // Last number is usually total
        total = parseFloat(numbers[numbers.length - 1]);
        
        // Second-to-last might be unit price
        const potentialPrice = parseFloat(numbers[numbers.length - 2]);
        
        // If we found quantity, and total seems like qty * price
        if (quantity > 1 && Math.abs(total - (potentialPrice * quantity)) < 1) {
          price = potentialPrice;
        } else if (quantity > 1 && total > 5) {
          // Total divided by quantity
          price = total / quantity;
        } else {
          price = total;
        }
      } else if (numbers.length === 1) {
        price = parseFloat(numbers[0]);
        total = price * quantity;
      }
      
      // Validate price range (₹1 to ₹1000 per unit)
      if (price <= 0 || price > 1000) continue;
      
      // Extract product name - SIMPLE AND RELIABLE METHOD
      let productName = '';
      const originalLine = line;
      
      console.log('\n📝 Processing:', originalLine);
      
      // Find where the first digit appears
      const firstDigitIndex = line.search(/\d/);
      
      if (firstDigitIndex > 0) {
        // Everything before the first digit is the product name
        productName = line.substring(0, firstDigitIndex);
      }
      
      // Clean the product name
      productName = productName.trim();
      productName = productName.replace(/\s+/g, ' '); // normalize spaces
      
      console.log('  Extracted name:', `"${productName}"`);
      console.log('  Length:', productName.length);
      
      // Validation: must have content and letters
      if (!productName || productName.length < 2) {
        console.log('  ❌ Skipped: too short');
        continue;
      }
      
      if (!/[a-zA-Z]/.test(productName)) {
        console.log('  ❌ Skipped: no letters');
        continue;
      }
      
      // Try to match with known products
      let matchedName = productName;
      const lowerProduct = productName.toLowerCase();
      
      for (const [keyword, fullName] of Object.entries(knownProducts)) {
        if (lowerProduct.includes(keyword)) {
          matchedName = fullName;
          console.log('  ✅ Matched:', fullName);
          break;
        }
      }
      
      // If no match, just capitalize properly
      if (matchedName === productName) {
        matchedName = productName
          .split(' ')
          .filter(word => word.length > 0)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        console.log('  ✅ Capitalized:', matchedName);
      }
      
      console.log('  ✅ FINAL:', matchedName);
      
      // Calculate confidence based on various factors
      let confidence = 0.5; // Base confidence
      
      // Increase confidence if:
      if (quantity > 1 && Math.abs(total - (price * quantity)) < 0.5) {
        confidence += 0.2; // Qty * Price = Total (math checks out)
      }
      if (Object.keys(knownProducts).some(k => lowerProduct.includes(k))) {
        confidence += 0.2; // Known product
      }
      if (line.match(/\d+\s*[xX×]/)) {
        confidence += 0.1; // Clear quantity indicator
      }
      if (productName.length >= 3) {
        confidence += 0.05; // Decent product name length
      }
      
      confidence = Math.min(confidence, 0.95);
      
      items.push({
        product_name: matchedName,
        quantity: quantity,
        price: parseFloat(price.toFixed(2)),
        confidence: confidence,
        rawLine: line // Keep original line for debugging
      });
    }
    
    // Remove duplicates (same product name + quantity + price)
    const uniqueItems = [];
    const seen = new Set();
    
    for (const item of items) {
      const key = `${item.product_name}-${item.quantity}-${item.price}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueItems.push(item);
      }
    }
    
    return uniqueItems;
  };

  const processImage = async () => {
    if (!image) return;
    
    setProcessing(true);
    setProgress(0);
    setShowResults(false);
    setOcrQuality('processing');
    
    try {
      // Preprocess image
      setProgress(10);
      const preprocessed = await preprocessImage(image);
      
      setProgress(20);
      
      // Run OCR with optimized config
      const result = await Tesseract.recognize(
        preprocessed,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(20 + Math.round(m.progress * 70));
            }
          },
          tessedit_pageseg_mode: Tesseract.PSM.AUTO,
          tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ₹.:/-xX×'
        }
      );
      
      setProgress(95);
      
      const text = result.data.text;
      setRawText(text);
      console.log('OCR Text:', text);
      
      // Assess OCR quality
      const confidence = result.data.confidence;
      if (confidence > 80) {
        setOcrQuality('high');
      } else if (confidence > 60) {
        setOcrQuality('medium');
      } else {
        setOcrQuality('low');
      }
      
      // Parse items
      const items = parseReceiptText(text);
      
      setProgress(100);
      
      if (items.length > 0) {
        setExtractedItems(items);
        setShowResults(true);
      } else {
        setOcrQuality('failed');
        alert('⚠️ No items found. Try:\n1. Use the sample receipt button\n2. Upload a clearer image\n3. Ensure good lighting');
      }
      
    } catch (error) {
      console.error('OCR Error:', error);
      setOcrQuality('error');
      alert('❌ OCR processing failed. Please try:\n1. Sample receipt\n2. Different image\n3. Better lighting');
    }
    
    setProcessing(false);
    setProgress(0);
  };

  const handleAddItems = () => {
    // EXTREME DEBUG
    alert('🔴 BUTTON CLICKED! Check console for details.');
    console.log('=== ADD TO BILL CLICKED ===');
    console.log('Number of items:', extractedItems.length);
    console.log('Items:', JSON.stringify(extractedItems, null, 2));
    console.log('onItemsExtracted function:', typeof onItemsExtracted);
    
    if (extractedItems.length === 0) {
      console.log('❌ No items to add');
      alert('⚠️ No items to add!');
      return;
    }
    
    // Filter out items with empty product names
    const validItems = extractedItems.filter(item => {
      const hasName = item.product_name && item.product_name.trim() !== '';
      const hasPrice = item.price > 0;
      const hasQty = item.quantity > 0;
      console.log(`Validating item:`, item.product_name, hasName, hasPrice, hasQty);
      return hasName && hasPrice && hasQty;
    });
    
    console.log('Valid items:', validItems.length, 'out of', extractedItems.length);
    
    const invalidCount = extractedItems.length - validItems.length;
    
    if (validItems.length === 0) {
      console.log('❌ No valid items (all have empty names)');
      alert('⚠️ All items have empty product names. Please edit them first!');
      return;
    }
    
    if (invalidCount > 0) {
      console.warn(`⚠️ Skipping ${invalidCount} items with empty names`);
    }
    
    // Call parent function with valid items only
    console.log('About to call onItemsExtracted...');
    try {
      onItemsExtracted(validItems, 'cash');
      console.log('✅ onItemsExtracted called successfully');
    } catch (error) {
      console.error('❌ Error calling onItemsExtracted:', error);
      alert('❌ Error: ' + error.message);
      return;
    }
    
    const message = invalidCount > 0 
      ? `✅ Added ${validItems.length} items to bill!\n⚠️ Skipped ${invalidCount} items with empty names.`
      : `✅ Added ${validItems.length} items to bill!`;
    
    console.log('✅ Items sent to parent');
    alert(message);
    
    // Reset
    console.log('Resetting OCR scanner...');
    handleReset();
    console.log('✅ Done!');
  };

  const handleRemoveItem = (index) => {
    setExtractedItems(extractedItems.filter((_, i) => i !== index));
  };

  const handleEditItem = (index, field, value) => {
    const updated = [...extractedItems];
    if (field === 'product_name') {
      updated[index][field] = value;
    } else {
      updated[index][field] = field === 'quantity' ? parseInt(value) || 1 : parseFloat(value) || 0;
    }
    setExtractedItems(updated);
  };

  const handleReset = () => {
    setImage(null);
    setExtractedItems([]);
    setShowResults(false);
    setRawText('');
    setOcrQuality('unknown');
  };

  const calculateTotal = () => {
    return extractedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <div className="card max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-3xl">📸</span>
          <span>Receipt Scanner (OCR)</span>
        </h2>
        
        {!image && (
          <button
            onClick={loadSampleReceipt}
            className="btn bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow flex items-center gap-2"
          >
            <span>✨</span>
            <span>Try Sample Receipt</span>
          </button>
        )}
      </div>
      
      {!image ? (
        <>
          {/* Upload Area */}
          <label className="block w-full border-2 border-dashed border-blue-300 rounded-xl p-16 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all bg-gradient-to-br from-blue-50 to-purple-50">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="text-9xl mb-6">📷</div>
            <div className="text-2xl font-bold text-gray-800 mb-3">Upload Receipt Image</div>
            <div className="text-gray-600 mb-4">
              Click to select or drag & drop
            </div>
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-semibold">
              💡 Or try the sample receipt above
            </div>
          </label>
          
          {/* Tips */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                <span>✅</span>
                <span>Best Results:</span>
              </h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Clear, well-lit photos</li>
                <li>• Straight, not angled</li>
                <li>• Printed receipts</li>
                <li>• High contrast</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <h4 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
                <span>⚠️</span>
                <span>Avoid:</span>
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Dark or blurry images</li>
                <li>• Shadows or glare</li>
                <li>• Handwritten receipts</li>
                <li>• Crumpled paper</li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div>
          {/* Image Preview */}
          <div className="mb-6 bg-gray-100 rounded-xl p-4 border-2 border-gray-300">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-700 flex items-center gap-2">
                <span>📄</span>
                <span>Receipt Image</span>
              </span>
              <button
                onClick={handleReset}
                className="text-sm text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
              >
                <span>✕</span>
                <span>Remove</span>
              </button>
            </div>
            <img 
              src={image} 
              alt="Receipt" 
              className="w-full max-h-96 object-contain rounded-lg border-2 border-gray-300 bg-white shadow"
            />
          </div>
          
          {/* Processing Progress */}
          {processing && (
            <div className="mb-6 bg-blue-50 rounded-xl p-6 border-2 border-blue-300 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-blue-900 flex items-center gap-3">
                  <span className="text-3xl animate-spin">🔍</span>
                  <span className="text-lg">Scanning receipt...</span>
                </span>
                <span className="text-2xl font-bold text-blue-700">{progress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-4 shadow-inner">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-300 shadow"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-4 text-sm text-blue-700 space-y-1">
                {progress < 20 && <p>• Preprocessing image...</p>}
                {progress >= 20 && progress < 90 && <p>• Extracting text with AI...</p>}
                {progress >= 90 && <p>• Parsing items...</p>}
              </div>
            </div>
          )}
          
          {/* Quality Indicator */}
          {ocrQuality !== 'unknown' && ocrQuality !== 'processing' && !processing && (
            <div className={`mb-6 rounded-xl p-4 border-2 ${
              ocrQuality === 'high' ? 'bg-green-50 border-green-300' :
              ocrQuality === 'medium' ? 'bg-yellow-50 border-yellow-300' :
              'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {ocrQuality === 'high' ? '✅' : ocrQuality === 'medium' ? '⚠️' : '❌'}
                </span>
                <div>
                  <div className="font-bold">
                    {ocrQuality === 'high' ? 'Excellent OCR Quality' :
                     ocrQuality === 'medium' ? 'Good OCR Quality - Please Review' :
                     'Poor OCR Quality - Manual Verification Needed'}
                  </div>
                  <div className="text-sm opacity-75 mt-1">
                    {ocrQuality === 'high' ? 'High confidence in extracted data' :
                     ocrQuality === 'medium' ? 'Some items may need correction' :
                     'Try sample receipt or upload clearer image'}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Extracted Items */}
          {showResults && extractedItems.length > 0 && (
            <div className="mb-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-300 shadow-lg">
              <h3 className="text-2xl font-bold text-green-900 mb-5 flex items-center gap-3">
                <span className="text-3xl">✅</span>
                <span>Found {extractedItems.length} item(s)</span>
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {extractedItems.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-5 border-2 border-green-200 hover:border-green-400 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Confidence Badge */}
                      <div className={`mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                        item.confidence >= 0.9 ? 'bg-green-100 text-green-800' :
                        item.confidence >= 0.7 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {Math.round(item.confidence * 100)}%
                      </div>
                      
                      {/* Editable Fields */}
                      <div className="flex-1 grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-gray-600 font-bold mb-1 block">Product</label>
                          <input
                            type="text"
                            value={item.product_name}
                            onChange={(e) => handleEditItem(index, 'product_name', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-semibold focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-600 font-bold mb-1 block">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleEditItem(index, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-semibold text-center focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-600 font-bold mb-1 block">Price (₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.price}
                            onChange={(e) => handleEditItem(index, 'price', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-semibold text-right focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      
                      {/* Total & Remove */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-xl font-bold text-green-700">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-all"
                          title="Remove item"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Grand Total */}
              <div className="mt-6 pt-5 border-t-2 border-green-400">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-800">Grand Total:</span>
                  <span className="text-4xl font-bold text-green-700">
                    ₹{calculateTotal().toFixed(2)}
                  </span>
                </div>
                <div className="text-right text-sm text-gray-600 mt-1">
                  {extractedItems.length} item{extractedItems.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            {!showResults ? (
              <>
                <button
                  onClick={processImage}
                  disabled={processing}
                  className={`flex-1 py-5 px-8 rounded-xl font-bold text-xl shadow-xl transition-all ${
                    processing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transform hover:scale-105'
                  }`}
                >
                  {processing ? '⏳ Processing...' : '🔍 Scan Receipt'}
                </button>
                <button
                  onClick={handleReset}
                  className="px-8 py-5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-lg rounded-xl transition-all"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleAddItems}
                  disabled={extractedItems.length === 0}
                  className="flex-1 py-5 px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-xl rounded-xl shadow-xl transition-all transform hover:scale-105"
                >
                  ✓ Add {extractedItems.length} Item{extractedItems.length !== 1 ? 's' : ''} to Bill
                </button>
                <button
                  onClick={handleReset}
                  className="px-8 py-5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg rounded-xl transition-all"
                >
                  New Scan
                </button>
              </>
            )}
          </div>

          {/* Raw Text Debug */}
          {rawText && (
            <div className="mt-6">
              <button
                onClick={() => setShowRawText(!showRawText)}
                className="text-sm text-gray-600 hover:text-gray-800 font-semibold flex items-center gap-2"
              >
                <span>{showRawText ? '▼' : '▶'}</span>
                <span>View Raw OCR Text (Debug)</span>
              </button>
              {showRawText && (
                <pre className="mt-3 p-4 bg-gray-100 rounded-lg text-xs overflow-auto max-h-48 border-2 border-gray-300">
                  {rawText}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OCRScanner;
