const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');
const transactionRoutes = require('./routes/transactions');
const productRoutes = require('./routes/products');
const ocrRoutes = require('./routes/ocr');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'KhataSnap Backend is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/transactions', transactionRoutes);
app.use('/api/products', productRoutes);
app.use('/api/ocr', ocrRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

async function startServer() {
  try {
    console.log('🔍 Testing Supabase connection...');
    await testConnection();
    
    app.listen(PORT, () => {
      console.log('');
      console.log('════════════════════════════════════════');
      console.log('🚀 KhataSnap Backend Server Started');
      console.log('════════════════════════════════════════');
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log('');
      console.log('📚 Available Routes:');
      console.log('  POST   /api/transactions/add');
      console.log('  POST   /api/transactions/voice-process');
      console.log('  GET    /api/transactions/daily-summary');
      console.log('  POST   /api/transactions/detect-mismatch');
      console.log('  POST   /api/ocr/process-text');
      console.log('  GET    /api/products');
      console.log('  POST   /api/products/add');
      console.log('  PUT    /api/products/update/:id');
      console.log('  DELETE /api/products/delete/:id');
      console.log('  POST   /api/products/search');
      console.log('');
      console.log('✨ Ready for development!');
      console.log('════════════════════════════════════════');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
