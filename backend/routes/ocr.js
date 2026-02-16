// OCR Routes
// Owner: Shashwat (AI Layer)

const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');
const { parseReceiptText } = require('../services/ocr-processor');

/**
 * POST /api/ocr/process-text
 * Process extracted text from receipt
 */
router.post('/process-text', async (req, res) => {
  try {
    const { extracted_text } = req.body;
    
    if (!extracted_text || extracted_text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Extracted text is required'
      });
    }
    
    console.log('Processing OCR text:', extracted_text.substring(0, 100) + '...');
    
    // Fetch available products for matching
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*');
    
    if (productError) {
      console.error('Error fetching products:', productError);
    }
    
    // Parse the text
    const result = await parseReceiptText(extracted_text, products || []);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to parse receipt text',
        details: result.error
      });
    }
    
    res.json({
      success: true,
      message: 'Receipt parsed successfully',
      data: result.data
    });
    
  } catch (error) {
    console.error('OCR Processing Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
