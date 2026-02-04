const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
{
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment"
    },
    amount: Number,
    method: String, // UPI/Card
    status: {
        type: String,
        enum: ["success", "failed", "pending"],
        default: "pending"
    },
    transactionId: String
},
{ timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);