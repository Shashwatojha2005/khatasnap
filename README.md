# 🎯 KhataSnap - Voice-Powered Billing System

## 📊 Team Ownership Structure

| Team Member | Ownership | Components |
|------------|-----------|------------|
| **Raj** | Input Layer | Calculator, ProductList, Inventory Management |
| **Rizvan** | Backend & Data Engine | Server, APIs, Database, Transaction Logic |
| **Shashwat** | AI/Intelligence Layer | Gemini AI, OCR, Voice Processing, Confidence Scoring |
| **Tina** | Dashboard & UI | Daily Summary, Reconciliation, Alerts, Demo Flow |
| **Suryansh** | Integration & QA | Full System Integration, Testing, Deployment |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Gemini API Key
- Supabase Account

### 1️⃣ Clone & Setup

```bash
# Navigate to project folder
cd khatasnap

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2️⃣ Configure Environment Variables

**Backend Setup:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add your credentials:
```env
PORT=5000

# Get from: https://supabase.com/dashboard
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Get from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key

NODE_ENV=development
```

### 3️⃣ Setup Database (Supabase)

**Create these tables in Supabase:**

**Products Table:**
```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Transactions Table:**
```sql
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  items JSONB NOT NULL,
  payment_mode TEXT CHECK (payment_mode IN ('cash', 'upi')),
  total_amount DECIMAL(10,2) DEFAULT 0,
  source TEXT DEFAULT 'manual',
  confidence_score DECIMAL(3,2),
  raw_transcript TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Insert Sample Products:**
```sql
INSERT INTO products (name, price, category, stock) VALUES
('Parle G', 10, 'Biscuits', 100),
('Maggi', 12, 'Noodles', 50),
('Coca Cola', 40, 'Beverages', 30),
('Lays', 20, 'Chips', 75);
```

### 4️⃣ Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs on: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
App runs on: `http://localhost:3000`

---

## 📁 Project Structure

```
khatasnap/
├── backend/                  # Rizvan's Domain
│   ├── server.js            # Main Express server
│   ├── routes/
│   │   ├── transactions.js  # Transaction APIs
│   │   └── products.js      # Product APIs
│   ├── services/
│   │   └── gemini.js        # AI processing (Shashwat)
│   ├── config/
│   │   └── database.js      # Supabase config
│   ├── .env                 # API keys (SECRET!)
│   └── package.json
│
└── frontend/                # Raj, Tina, Shashwat, Suryansh
    ├── src/
    │   ├── components/
    │   │   ├── raj/         # Input components
    │   │   │   ├── Calculator.jsx
    │   │   │   └── ProductList.jsx
    │   │   ├── shashwat/    # AI components
    │   │   │   ├── VoiceInput.jsx
    │   │   │   └── OCRReader.jsx
    │   │   └── tina/        # Dashboard components
    │   │       └── DailySummary.jsx
    │   ├── services/
    │   │   └── api.js       # Backend communication (Suryansh)
    │   ├── App.jsx          # Main integration (Suryansh)
    │   └── main.jsx
    └── package.json
```

---

## 🔌 API Endpoints

### Transactions
```
POST   /api/transactions/add              # Add manual transaction
POST   /api/transactions/voice-process    # Process voice input
GET    /api/transactions/daily-summary    # Get daily summary
POST   /api/transactions/detect-mismatch  # Detect mismatches
```

### Products
```
GET    /api/products                      # Get all products
POST   /api/products/add                  # Add new product
PUT    /api/products/update/:id           # Update product
DELETE /api/products/delete/:id           # Delete product
POST   /api/products/search               # Search products
```

---

## 🎤 Voice Input Usage

**Example Voice Commands:**
- "2 Parle G and 1 Maggi UPI"
- "3 Coca Cola cash"
- "5 Lays 2 Maggi UPI payment"

**How it works:**
1. Click microphone button
2. Speak naturally
3. AI extracts items, quantities, payment mode
4. System shows confidence score
5. Auto-saves if confidence > 70%

---

## 🧪 Testing Guide

### Backend Tests
```bash
# Test API with curl
curl http://localhost:5000/health
curl http://localhost:5000/api/products
```

### Frontend Tests
1. Open `http://localhost:3000`
2. Click through all tabs
3. Test voice input (Chrome/Edge only)
4. Test OCR with receipt image
5. Check daily summary

---

## 🐛 Troubleshooting

**Backend won't start:**
- Check if `.env` file exists
- Verify Supabase credentials
- Ensure port 5000 is free

**Frontend won't connect:**
- Check if backend is running
- Verify proxy in `vite.config.js`
- Check browser console for errors

**Voice not working:**
- Use Chrome or Edge browser
- Allow microphone permission
- Check browser console

**OCR slow:**
- Tesseract.js takes 5-10 seconds
- Use clear, high-contrast images
- Ensure good lighting

---

## 🚀 Deployment (For Later)

**Backend:**
- Deploy to Render, Railway, or Heroku
- Add environment variables
- Connect to production Supabase

**Frontend:**
- Deploy to Vercel or Netlify
- Update API URL in env
- Build: `npm run build`

---

## 👥 Team Workflow

### Development Flow:
1. **Rizvan** → Ensures backend APIs work
2. **Raj** → Builds input components
3. **Shashwat** → Adds AI intelligence
4. **Tina** → Creates dashboard UI
5. **Suryansh** → Integrates everything & tests

### Before Demo:
- Suryansh runs full integration test
- Each member demos their component
- Practice the complete flow 3 times

---

## 📞 Support

**Issues?**
- Check console logs
- Test API endpoints individually
- Verify database connection

**Questions?**
Ask your team member:
- Backend: Rizvan
- Frontend: Raj/Tina
- AI: Shashwat
- Integration: Suryansh

---

## ✅ Next Steps

1. ✅ Setup complete
2. ⏳ Add sample products
3. ⏳ Test voice input
4. ⏳ Test OCR
5. ⏳ Build mismatch detection UI (Tina)
6. ⏳ Add confidence indicators (Tina)
7. ⏳ Final integration (Suryansh)
8. ⏳ Demo rehearsal

---

**Built with ❤️ by Team KhataSnap**
