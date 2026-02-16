const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');
const { processTransaction, detectMismatch } = require('../services/gemini');

router.post('/voice-process', async (req, res) => {
  try {
    const { transcript } = req.body;
    
    if (!transcript) {
      return res.status(400).json({
        success: false,
        error: 'Transcript is required'
      });
    }
    
    console.log('Processing voice transcript:', transcript);
    
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*');
    
    if (productError) {
      console.error('Error fetching products:', productError);
    }
    
    const aiResult = await processTransaction(transcript, products || []);
    
    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        error: 'AI processing failed',
        details: aiResult.error
      });
    }
    
    console.log('AI extraction result:', aiResult.data);
    
    const totalAmount = aiResult.data.items.reduce((sum, item) => {
      return sum + (item.price || 0) * item.quantity;
    }, 0);
    
    if (aiResult.data.total_confidence >= 0.7) {
      const { data: savedTransaction, error: saveError } = await supabase
        .from('transactions')
        .insert([
          {
            items: aiResult.data.items,
            payment_mode: aiResult.data.payment_mode,
            total_amount: totalAmount,
            source: 'voice',
            confidence_score: aiResult.data.total_confidence,
            raw_transcript: transcript,
            created_at: new Date().toISOString()
          }
        ])
        .select();
      
      if (saveError) {
        console.error('Error saving transaction:', saveError);
        return res.status(500).json({
          success: false,
          error: 'Failed to save transaction',
          details: saveError.message
        });
      }
      
      return res.json({
        success: true,
        message: 'Transaction processed and saved automatically',
        auto_saved: true,
        transaction: savedTransaction[0],
        ai_analysis: aiResult.data,
        total_amount: totalAmount
      });
    } else {
      return res.json({
        success: true,
        message: 'Low confidence - please review before saving',
        requires_review: true,
        ai_analysis: aiResult.data,
        total_amount: totalAmount
      });
    }
    
  } catch (error) {
    console.error('Voice Processing Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/add', async (req, res) => {
  try {
    const { items, payment_mode, total_amount, source } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Items are required' 
      });
    }
    
    if (!payment_mode || !['cash', 'upi'].includes(payment_mode)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid payment mode. Use "cash" or "upi"' 
      });
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          items: items,
          payment_mode: payment_mode,
          total_amount: total_amount || 0,
          source: source || 'manual',
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Transaction added successfully',
      data: data[0]
    });
    
  } catch (error) {
    console.error('Transaction Add Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/daily-summary', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', `${targetDate}T00:00:00`)
      .lt('created_at', `${targetDate}T23:59:59`);
    
    if (error) throw error;
    
    const summary = {
      date: targetDate,
      total_transactions: data.length,
      cash: {
        count: 0,
        total: 0,
        transactions: []
      },
      upi: {
        count: 0,
        total: 0,
        transactions: []
      }
    };
    
    data.forEach(txn => {
      if (txn.payment_mode === 'cash') {
        summary.cash.count++;
        summary.cash.total += parseFloat(txn.total_amount) || 0;
        summary.cash.transactions.push(txn);
      } else if (txn.payment_mode === 'upi') {
        summary.upi.count++;
        summary.upi.total += parseFloat(txn.total_amount) || 0;
        summary.upi.transactions.push(txn);
      }
    });
    
    res.json({
      success: true,
      data: summary
    });
    
  } catch (error) {
    console.error('Daily Summary Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/detect-mismatch', async (req, res) => {
  try {
    const { expected, actual } = req.body;
    
    const analysis = await detectMismatch(expected, actual);
    
    res.json({
      success: true,
      data: analysis
    });
    
  } catch (error) {
    console.error('Mismatch Detection Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
