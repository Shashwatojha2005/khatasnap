// Production OCR Parser with Advanced Error Handling
const { fuzzyMatchProduct, correctOCRErrors, suggestCorrections } = require('./fuzzy-matcher');

function classifyLine(line) {
  const lower = line.toLowerCase();
  
  // Header indicators
  if (lower.match(/receipt|store|shop|bill|invoice|date|time|phone|address|customer/)) return 'header';
  
  // Footer indicators  
  if (lower.match(/total|subtotal|tax|payment|thank|visit|paid/)) return 'footer';
  
  // Separator
  if (line.match(/^[=\-*]+$/)) return 'separator';
  
  // Item line - has numbers
  if (line.match(/\d/) && line.length > 3) return 'item';
  
  return 'unknown';
}

function extractItemFromLine(line, availableProducts) {
  console.log(`\n📝 Parsing: "${line}"`);
  
  // Extract all numbers
  const allNumbers = line.match(/\d+(?:\.\d{2})?/g) || [];
  console.log('  Numbers:', allNumbers);
  
  if (allNumbers.length === 0) {
    console.log('  ❌ No numbers found');
    return null;
  }
  
  // Extract quantity
  let quantity = 1;
  const qtyMatch = line.match(/(\d+)\s*x/i);
  if (qtyMatch) {
    quantity = parseInt(qtyMatch[1]);
  }
  
  // Extract prices
  let unitPrice = 0;
  let totalPrice = 0;
  
  if (allNumbers.length >= 3) {
    // Format: Qty Unit Total
    unitPrice = parseFloat(allNumbers[allNumbers.length - 2]);
    totalPrice = parseFloat(allNumbers[allNumbers.length - 1]);
  } else if (allNumbers.length === 2) {
    totalPrice = parseFloat(allNumbers[allNumbers.length - 1]);
    unitPrice = totalPrice / quantity;
  } else {
    totalPrice = parseFloat(allNumbers[0]);
    unitPrice = totalPrice / quantity;
  }
  
  // Validate prices
  if (totalPrice < 1 || unitPrice < 0.1) {
    console.log('  ❌ Invalid prices');
    return null;
  }
  
  // Extract product name
  let productName = line;
  productName = productName.replace(/\d+\s*x/gi, '');
  productName = productName.replace(/₹/g, '');
  productName = productName.replace(/Rs\.?/gi, '');
  productName = productName.replace(/\d+(?:\.\d{2})?/g, '');
  productName = productName.replace(/[-_|]/g, ' ');
  productName = productName.replace(/\s+/g, ' ').trim();
  
  console.log('  Extracted name:', `"${productName}"`);
  
  if (productName.length < 2) {
    console.log('  ❌ Name too short');
    return null;
  }
  
  // Apply OCR error correction
  const correctedName = correctOCRErrors(productName);
  if (correctedName !== productName) {
    console.log(`  🔧 Auto-corrected: "${productName}" → "${correctedName}"`);
    productName = correctedName;
  }
  
  // Fuzzy match with database
  const matchResult = fuzzyMatchProduct(productName, availableProducts);
  
  if (matchResult) {
    console.log(`  ✅ MATCHED: "${matchResult.product.name}" (${(matchResult.score * 100).toFixed(0)}% confidence, ${matchResult.reason})`);
    
    return {
      product_name: matchResult.product.name,
      original_ocr_text: matchResult.original,
      quantity: quantity,
      price: unitPrice,
      line_total: totalPrice,
      confidence: matchResult.confidence,
      matched_from_db: true,
      match_reason: matchResult.reason,
      product_id: matchResult.product.id,
      db_price: matchResult.product.price,
      raw_line: line
    };
  } else {
    console.log(`  ⚠️  No match found`);
    
    // Get suggestions
    const suggestions = suggestCorrections(productName, availableProducts);
    console.log(`  💡 Suggestions:`, suggestions.map(s => `${s.name} (${(s.similarity * 100).toFixed(0)}%)`));
    
    return {
      product_name: productName,
      original_ocr_text: productName,
      quantity: quantity,
      price: unitPrice,
      line_total: totalPrice,
      confidence: 0.5,
      matched_from_db: false,
      suggestions: suggestions,
      raw_line: line
    };
  }
}

function parseReceiptText(extractedText, availableProducts = []) {
  try {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   PRODUCTION OCR PARSER - STARTING    ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('📄 Text length:', extractedText.length);
    console.log('🗄️  Products in DB:', availableProducts.length);
    
    const lines = extractedText.split('\n');
    const items = [];
    let totalFromReceipt = null;
    let paymentMode = 'cash';
    
    console.log('📋 Total lines:', lines.length);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length === 0) continue;
      
      const type = classifyLine(line);
      
      if (type === 'item') {
        const item = extractItemFromLine(line, availableProducts);
        if (item) {
          items.push(item);
        }
      } else if (type === 'footer') {
        // Extract total
        if (line.toLowerCase().includes('total') && !line.toLowerCase().includes('subtotal')) {
          const totalMatch = line.match(/\d+(?:\.\d{2})?/);
          if (totalMatch) {
            totalFromReceipt = parseFloat(totalMatch[0]);
            console.log(`\n💰 Receipt Total: ₹${totalFromReceipt}`);
          }
        }
        
        // Extract payment mode
        if (line.toLowerCase().includes('upi') || line.toLowerCase().includes('online')) {
          paymentMode = 'upi';
          console.log('💳 Payment: UPI');
        } else if (line.toLowerCase().includes('cash')) {
          paymentMode = 'cash';
          console.log('💵 Payment: Cash');
        }
      }
    }
    
    const calculatedTotal = items.reduce((sum, item) => sum + item.line_total, 0);
    
    const matchedCount = items.filter(i => i.matched_from_db).length;
    const avgConfidence = items.length > 0
      ? items.reduce((sum, item) => sum + item.confidence, 0) / items.length
      : 0;
    
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║         PARSING COMPLETE ✅            ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`📦 Items extracted: ${items.length}`);
    console.log(`✅ DB matched: ${matchedCount}/${items.length}`);
    console.log(`💯 Avg confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    console.log(`💰 Calculated total: ₹${calculatedTotal.toFixed(2)}`);
    if (totalFromReceipt) {
      const match = Math.abs(totalFromReceipt - calculatedTotal) < 5;
      console.log(`💰 Receipt total: ₹${totalFromReceipt} ${match ? '✅ MATCH' : '⚠️  MISMATCH'}`);
    }
    console.log('════════════════════════════════════════\n');
    
    return {
      success: true,
      data: {
        items: items,
        calculated_total: calculatedTotal,
        extracted_total: totalFromReceipt,
        payment_mode: paymentMode,
        total_confidence: avgConfidence,
        matched_count: matchedCount,
        total_count: items.length,
        match_rate: items.length > 0 ? matchedCount / items.length : 0,
        raw_text: extractedText
      }
    };
    
  } catch (error) {
    console.error('❌ OCR parsing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { parseReceiptText };
