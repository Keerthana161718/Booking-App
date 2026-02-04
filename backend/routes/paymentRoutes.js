const express = require("express");
const router = express.Router();

const {
  createPayment,
  getMyPayments,
  cancelPayment,
} = require("../Controllers/paymentController");

const auth = require("../middleware/authMiddleware");

// Create payment
router.post("/pay", auth, createPayment);

// Get my payments
router.get("/my", auth, getMyPayments);

// Cancel payment
router.put("/cancel/:id", auth, cancelPayment);

module.exports = router;