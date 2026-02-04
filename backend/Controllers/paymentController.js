const Payment = require("../models/Payment");

// Create payment
exports.createPayment = async (req, res) => {
  try {
    const payment = await Payment.create({
      ...req.body,
      user: req.user.id,
    });

    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get my payments
exports.getMyPayments = async (req, res) => {
  const payments = await Payment.find({
    user: req.user.id,
  });

  res.json(payments);
};

// Cancel payment
exports.cancelPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment)
      return res.status(404).json({ msg: "Payment not found" });

    payment.status = "failed"; // or "cancelled"
    await payment.save();

    res.json({ msg: "Payment cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};