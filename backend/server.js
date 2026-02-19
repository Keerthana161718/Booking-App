const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

const connectDB = require("./config/db");

// Load env variables from backend/.env so running from project root still works
dotenv.config({ path: path.join(__dirname, ".env") });

// Connect database and ensure admin exists
(async () => {
  await connectDB();
  // create admin user on startup if missing (uses ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME env vars)
  try { await require('./utils/createAdmin')(); } catch(e) { console.warn('createAdmin failed:', e); }
})();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/providers", require("./routes/providerRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use('/api/debug', require('./routes/debugRoutes'));

// Admin routes
app.use('/api/admin', require('./routes/adminRoutes'));

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Health check for external services (Render/Load balancers)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error middleware (last)
const errorMiddleware = require("./middleware/errorMiddleware");
app.use(errorMiddleware);

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);