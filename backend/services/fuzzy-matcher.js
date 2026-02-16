// Advanced Fuzzy Matching for OCR Error Correction
// Handles real-world messy text

// Levenshtein Distance - measures text similarity
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return matrix[len1][len2];
}

// Calculate similarity score (0-1)
function calculateSimilarity(str1, str2) {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  
  const distance = levenshteinDistance(s1, s2);
  return 1 - (distance / maxLen);
}

// Common OCR Error Patterns (learned from real receipts)
const ocrErrorPatterns = {
  // Character confusions
  '0': ['O', 'o', 'Q'],
  '1': ['I', 'l', '|'],
  '2': ['Z', 'z'],
  '5': ['S', 's'],
  '8': ['B'],
  'a': ['@', 'e'],
  'e': ['o', 'c'],
  'i': ['l', '1'],
  'o': ['0', 'O'],
  's': ['$', '5'],
  
  // Common word errors
  'Parla': 'Parle',
  'Parlo': 'Parle',
  'Megs': 'Maggi',
  'Maggl': 'Maggi',
  'Pops': 'Pepsi',
  'Popsi': 'Pepsi',
  'Kurkuro': 'Kurkure',
  'Kukure': 'Kurkure',
  'Britanla': 'Britannia',
  'Britania': 'Britannia',
  'Goed': 'Good',
  'Goot': 'Good',
  'Cocacola': 'Coca Cola',
  'CocaCola': 'Coca Cola'
};

// Apply OCR error corrections
function correctOCRErrors(text) {
  let corrected = text;
  
  // Apply known error patterns
  for (const [wrong, right] of Object.entries(ocrErrorPatterns)) {
    const regex = new RegExp(wrong, 'gi');
    corrected = corrected.replace(regex, right);
  }
  
  return corrected;
}

// Tokenize and match words
function tokenMatch(extracted, dbName) {
  const extractedWords = extracted.toLowerCase().split(/\s+/);
  const dbWords = dbName.toLowerCase().split(/\s+/);
  
  let matches = 0;
  for (const ew of extractedWords) {
    for (const dw of dbWords) {
      if (ew === dw || calculateSimilarity(ew, dw) > 0.8) {
        matches++;
        break;
      }
    }
  }
  
  return matches / Math.max(extractedWords.length, dbWords.length);
}

// Phonetic matching (sounds similar)
function soundex(s) {
  const a = s.toLowerCase().split('');
  const f = a.shift();
  const r = a
    .map(v => {
      switch (v) {
        case 'b': case 'f': case 'p': case 'v': return 1;
        case 'c': case 'g': case 'j': case 'k': case 'q': case 's': case 'x': case 'z': return 2;
        case 'd': case 't': return 3;
        case 'l': return 4;
        case 'm': case 'n': return 5;
        case 'r': return 6;
        default: return 0;
      }
    })
    .filter((v, i, arr) => i === 0 || v !== arr[i - 1])
    .filter(v => v !== 0)
    .join('');
  
  return (f + r + '000').slice(0, 4);
}

// Advanced fuzzy product matching
function fuzzyMatchProduct(extractedName, availableProducts) {
  // Pre-process extracted name
  const cleaned = correctOCRErrors(extractedName);
  const searchTerm = cleaned.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  
  let bestMatch = null;
  let bestScore = 0;
  let matchReason = '';
  
  for (const product of availableProducts) {
    const dbName = product.name.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    
    // Method 1: Exact match
    if (searchTerm === dbName) {
      return {
        product: product,
        score: 1.0,
        confidence: 0.99,
        reason: 'exact_match',
        original: extractedName,
        corrected: cleaned
      };
    }
    
    // Method 2: Substring match
    if (searchTerm.includes(dbName) || dbName.includes(searchTerm)) {
      const score = 0.95;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = product;
        matchReason = 'substring_match';
      }
    }
    
    // Method 3: Levenshtein similarity
    const similarity = calculateSimilarity(searchTerm, dbName);
    if (similarity > bestScore && similarity > 0.65) {
      bestScore = similarity;
      bestMatch = product;
      matchReason = 'similarity_match';
    }
    
    // Method 4: Token matching
    const tokenScore = tokenMatch(searchTerm, dbName);
    if (tokenScore > bestScore && tokenScore > 0.6) {
      bestScore = tokenScore;
      bestMatch = product;
      matchReason = 'token_match';
    }
    
    // Method 5: Phonetic matching (sounds similar)
    if (soundex(searchTerm) === soundex(dbName)) {
      const score = 0.8;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = product;
        matchReason = 'phonetic_match';
      }
    }
  }
  
  if (bestMatch && bestScore > 0.65) {
    return {
      product: bestMatch,
      score: bestScore,
      confidence: bestScore,
      reason: matchReason,
      original: extractedName,
      corrected: cleaned
    };
  }
  
  return null;
}

// Suggest corrections for unmatched items
function suggestCorrections(extractedName, availableProducts) {
  const suggestions = [];
  
  for (const product of availableProducts) {
    const similarity = calculateSimilarity(
      extractedName.toLowerCase(),
      product.name.toLowerCase()
    );
    
    if (similarity > 0.5) {
      suggestions.push({
        name: product.name,
        similarity: similarity,
        product: product
      });
    }
  }
  
  return suggestions
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3); // Top 3 suggestions
}

module.exports = {
  fuzzyMatchProduct,
  correctOCRErrors,
  calculateSimilarity,
  suggestCorrections,
  levenshteinDistance
};
