// Pattern-Based Voice Processor (No AI Required)
// Owner: Shashwat (AI Layer) - But using pattern matching instead

function convertWordToNumber(word) {
  const numbers = {
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
    'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
    'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13,
    'fourteen': 14, 'fifteen': 15, 'sixteen': 16, 'seventeen': 17,
    'eighteen': 18, 'nineteen': 19, 'twenty': 20,
    'do': 2, 'teen': 3, 'char': 4, 'paanch': 5
  };
  
  const lower = word.toLowerCase().trim();
  return numbers[lower] !== undefined ? numbers[lower] : null;
}

function calculateSimilarity(str1, str2) {
  const s1 = str1.toLowerCase().replace(/[-\s]/g, '');
  const s2 = str2.toLowerCase().replace(/[-\s]/g, '');
  
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }
  
  return matches / longer.length;
}

function detectPaymentMode(text) {
  const lower = text.toLowerCase();
  
  const upiKeywords = ['upi', 'online', 'paytm', 'gpay', 'phonepe', 'digital'];
  const cashKeywords = ['cash', 'nakad'];
  
  for (const keyword of upiKeywords) {
    if (lower.includes(keyword)) return 'upi';
  }
  
  for (const keyword of cashKeywords) {
    if (lower.includes(keyword)) return 'cash';
  }
  
  return 'cash';
}

function extractItems(transcript, availableProducts) {
  const items = [];
  const words = transcript.split(/\s+/);
  
  let currentQuantity = null;
  let potentialProduct = [];
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    const numericValue = parseInt(word);
    if (!isNaN(numericValue)) {
      currentQuantity = numericValue;
      continue;
    }
    
    const wordAsNumber = convertWordToNumber(word);
    if (wordAsNumber !== null) {
      currentQuantity = wordAsNumber;
      continue;
    }
    
    const stopWords = ['and', 'with', 'also', 'plus', 'upi', 'cash', 'payment'];
    if (stopWords.includes(word.toLowerCase())) {
      if (potentialProduct.length > 0 && currentQuantity) {
        const productName = potentialProduct.join(' ');
        const matchedProduct = findBestMatch(productName, availableProducts);
        
        if (matchedProduct) {
          items.push({
            product_name: matchedProduct.name,
            product_id: matchedProduct.id,
            price: matchedProduct.price,
            quantity: currentQuantity,
            confidence: matchedProduct.similarity
          });
        }
        
        potentialProduct = [];
        currentQuantity = null;
      }
      continue;
    }
    
    potentialProduct.push(word);
  }
  
  if (potentialProduct.length > 0 && currentQuantity) {
    const productName = potentialProduct.join(' ');
    const matchedProduct = findBestMatch(productName, availableProducts);
    
    if (matchedProduct) {
      items.push({
        product_name: matchedProduct.name,
        product_id: matchedProduct.id,
        price: matchedProduct.price,
        quantity: currentQuantity,
        confidence: matchedProduct.similarity
      });
    }
  }
  
  return items;
}

function findBestMatch(searchTerm, products) {
  let bestMatch = null;
  let bestScore = 0;
  
  for (const product of products) {
    const score = calculateSimilarity(searchTerm, product.name);
    
    if (score > bestScore && score > 0.5) {
      bestScore = score;
      bestMatch = {
        ...product,
        similarity: score
      };
    }
  }
  
  return bestMatch;
}

async function processTransaction(transcript, availableProducts = []) {
  try {
    console.log('Processing with pattern matching:', transcript);
    
    const items = extractItems(transcript, availableProducts);
    const paymentMode = detectPaymentMode(transcript);
    
    const avgConfidence = items.length > 0
      ? items.reduce((sum, item) => sum + item.confidence, 0) / items.length
      : 0;
    
    return {
      success: true,
      data: {
        items: items,
        payment_mode: paymentMode,
        total_confidence: avgConfidence,
        raw_transcript: transcript
      }
    };
  } catch (error) {
    console.error('Pattern matching error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

async function detectMismatch(expected, actual) {
  const mismatches = [];
  
  if (expected.payment_mode !== actual.payment_mode) {
    mismatches.push({
      field: 'payment_mode',
      expected_value: expected.payment_mode,
      actual_value: actual.payment_mode,
      severity: 'high'
    });
  }
  
  if (Math.abs(expected.total_amount - actual.total_amount) > 10) {
    mismatches.push({
      field: 'total_amount',
      expected_value: expected.total_amount,
      actual_value: actual.total_amount,
      severity: 'high'
    });
  }
  
  return {
    has_mismatch: mismatches.length > 0,
    mismatches: mismatches,
    suggestion: mismatches.length > 0 
      ? 'Please verify the transaction details'
      : 'Transaction looks correct',
    confidence: mismatches.length === 0 ? 1.0 : 0.5
  };
}

module.exports = {
  processTransaction,
  detectMismatch
};
