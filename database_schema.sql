-- KhataSnap Database Schema
-- Platform: Supabase (PostgreSQL)
-- Owner: Rizvan (Backend & Data Engine)

-- ========================================
-- PRODUCTS TABLE
-- ========================================
-- Purpose: Store shop inventory
-- Owner: Raj (Input Layer)

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  category TEXT DEFAULT 'General',
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster product search
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);

-- ========================================
-- TRANSACTIONS TABLE
-- ========================================
-- Purpose: Store all billing transactions
-- Owner: Rizvan (Backend)

CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  items JSONB NOT NULL,
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('cash', 'upi')),
  total_amount DECIMAL(10,2) DEFAULT 0 CHECK (total_amount >= 0),
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'voice', 'ocr')),
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  raw_transcript TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_transactions_date ON transactions(created_at);
CREATE INDEX idx_transactions_payment_mode ON transactions(payment_mode);
CREATE INDEX idx_transactions_source ON transactions(source);

-- ========================================
-- SAMPLE DATA
-- ========================================

-- Insert sample products
INSERT INTO products (name, price, category, stock) VALUES
('Parle G', 10.00, 'Biscuits', 100),
('Maggi', 12.00, 'Noodles', 50),
('Coca Cola', 40.00, 'Beverages', 30),
('Lays Chips', 20.00, 'Snacks', 75),
('Britannia Marie', 15.00, 'Biscuits', 60),
('Pepsi', 40.00, 'Beverages', 25),
('Kurkure', 20.00, 'Snacks', 45),
('Good Day', 30.00, 'Biscuits', 40)
ON CONFLICT DO NOTHING;

-- ========================================
-- USEFUL QUERIES
-- ========================================

-- Get today's transactions
-- SELECT * FROM transactions 
-- WHERE DATE(created_at) = CURRENT_DATE;

-- Get cash vs UPI summary for today
-- SELECT 
--   payment_mode,
--   COUNT(*) as transaction_count,
--   SUM(total_amount) as total_amount
-- FROM transactions
-- WHERE DATE(created_at) = CURRENT_DATE
-- GROUP BY payment_mode;

-- Get low stock products
-- SELECT * FROM products 
-- WHERE stock < 10 
-- ORDER BY stock ASC;

-- Get high confidence transactions
-- SELECT * FROM transactions 
-- WHERE confidence_score >= 0.7 
-- ORDER BY created_at DESC;

-- ========================================
-- NOTES FOR TEAM
-- ========================================
-- 1. Copy this entire file
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Paste and run
-- 4. Tables will be created with sample data
-- 5. Backend will connect automatically
