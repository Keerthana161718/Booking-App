const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: String,
    time: String,
    status: {
        type: String,
        enum: ["booked", "cancelled", "completed"],
        default: "booked"
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending"
    },
    // whether provider has seen/notified about this booking
    seenByProvider: {
        type: Boolean,
        default: false
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);