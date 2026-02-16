const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { testConnection } = require("./config/database");
const transactionRoutes = require("./routes/transactions");
const productRoutes = require("./routes/products");
const ocrRoutes = require("./routes/ocr");

const app = express();
const PORT = process.env.PORT || 5000;

/*
  ================================
  CORS CONFIGURATION
  ================================
  Allows:
  - Local development
  - Your deployed Render frontend
*/

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://khatasnap-2.onrender.com", // 🔥 your production frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // 🔥 handle preflight properly

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
  ================================
  HEALTH CHECK
  ================================
*/

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "KhataSnap Backend is running",
    timestamp: new Date().toISOString(),
  });
});

/*
  ================================
  API ROUTES
  ================================
*/

app.use("/api/transactions", transactionRoutes);
app.use("/api/products", productRoutes);
app.use("/api/ocr", ocrRoutes);

/*
  ================================
  404 HANDLER
  ================================
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

/*
  ================================
  ERROR HANDLER
  ================================
*/

app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

/*
  ================================
  START SERVER
  ================================
*/

async function startServer() {
  try {
    console.log("🔍 Testing Supabase connection...");
    await testConnection();

    app.listen(PORT, () => {
      console.log("");
      console.log("════════════════════════════════════════");
      console.log("🚀 KhataSnap Backend Server Started");
      console.log("════════════════════════════════════════");
      console.log(`🌍 Running on PORT: ${PORT}`);
      console.log(`🏥 Health: /health`);
      console.log("════════════════════════════════════════");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
