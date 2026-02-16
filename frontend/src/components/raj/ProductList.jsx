import React, { useState, useEffect } from 'react';
import { getAllProducts, addProduct, updateProduct, deleteProduct } from '../../services/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getAllProducts();
      
      if (result.success && result.data) {
        setProducts(result.data);
      } else {
        setError(result.error || 'Failed to load products');
      }
    } catch (err) {
      console.error('Products fetch error:', err);
      setError('Failed to connect to server');
    }
    
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: '',
      stock: ''
    });
    setEditingProduct(null);
    setShowAddModal(false);
  };

  const validateForm = () => {
    if (!formData.name || formData.name.trim().length < 2) {
      alert('⚠️ Product name must be at least 2 characters');
      return false;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('⚠️ Price must be greater than 0');
      return false;
    }
    
    if (formData.stock && parseInt(formData.stock) < 0) {
      alert('⚠️ Stock cannot be negative');
      return false;
    }
    
    return true;
  };

  const handleAddProduct = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const productData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        category: formData.category.trim() || 'General',
        stock: formData.stock ? parseInt(formData.stock) : 0
      };
      
      const result = await addProduct(productData);
      
      if (result.success) {
        alert('✅ Product added successfully!');
        resetForm();
        fetchProducts();
      } else {
        alert('❌ Failed to add product: ' + result.error);
      }
    } catch (err) {
      console.error('Add product error:', err);
      alert('❌ Error adding product');
    }
    
    setLoading(false);
  };

  const handleUpdateProduct = async () => {
    if (!validateForm() || !editingProduct) return;
    
    setLoading(true);
    
    try {
      const updates = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        category: formData.category.trim() || 'General',
        stock: formData.stock ? parseInt(formData.stock) : 0
      };
      
      const result = await updateProduct(editingProduct.id, updates);
      
      if (result.success) {
        alert('✅ Product updated successfully!');
        resetForm();
        fetchProducts();
      } else {
        alert('❌ Failed to update product: ' + result.error);
      }
    } catch (err) {
      console.error('Update product error:', err);
      alert('❌ Error updating product');
    }
    
    setLoading(false);
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await deleteProduct(product.id);
      
      if (result.success) {
        alert('✅ Product deleted successfully!');
        fetchProducts();
      } else {
        alert('❌ Failed to delete product: ' + result.error);
      }
    } catch (err) {
      console.error('Delete product error:', err);
      alert('❌ Error deleting product');
    }
    
    setLoading(false);
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category || '',
      stock: product.stock ? product.stock.toString() : '0'
    });
    setShowAddModal(true);
  };

  if (loading && products.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="text-5xl mb-4">⏳</div>
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-600 font-semibold">{error}</p>
          <button 
            onClick={fetchProducts}
            className="btn btn-primary mt-4"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">📦 Product Inventory</h2>
            <p className="text-gray-600 mt-1">{products.length} products in stock</p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div 
              key={product.id}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
                  {product.category && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-1 inline-block">
                      {product.category}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-bold text-green-600">₹{product.price.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Stock:</span>
                  <span className={`font-semibold ${
                    product.stock > 10 ? 'text-green-600' : 
                    product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {product.stock || 0} units
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(product)}
                  className="btn btn-secondary flex-1 text-sm"
                  disabled={loading}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteProduct(product)}
                  className="btn bg-red-500 text-white hover:bg-red-600 flex-1 text-sm"
                  disabled={loading}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg font-medium">No products yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Click "Add Product" to get started
            </p>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g., Parle G"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  maxLength={100}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input w-full"
                  placeholder="e.g., 10.00"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g., Biscuits"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  maxLength={50}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  className="input w-full"
                  placeholder="e.g., 100"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                className="btn btn-primary flex-1"
                disabled={loading}
              >
                {loading ? '⏳ Saving...' : editingProduct ? '💾 Update' : '➕ Add'}
              </button>
              <button
                onClick={resetForm}
                className="btn bg-gray-300 hover:bg-gray-400"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
