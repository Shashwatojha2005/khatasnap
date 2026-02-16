// Products Routes
// Owner: Raj (Input Layer) + Rizvan (Backend)

const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');

/**
 * GET /api/products
 * Get all products for inventory listing
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Products Fetch Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/products/add
 * Add new product to inventory
 */
router.post('/add', async (req, res) => {
  try {
    const { name, price, category, stock } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        error: 'Product name and price are required'
      });
    }
    
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name: name,
          price: parseFloat(price),
          category: category || 'General',
          stock: stock || 0,
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Product added successfully',
      data: data[0]
    });
    
  } catch (error) {
    console.error('Product Add Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/products/update/:id
 * Update product details
 */
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: data[0]
    });
    
  } catch (error) {
    console.error('Product Update Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/products/delete/:id
 * Delete product from inventory
 */
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
    
  } catch (error) {
    console.error('Product Delete Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/products/search
 * Search products by name (for voice/OCR matching)
 */
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${query}%`);
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Product Search Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
