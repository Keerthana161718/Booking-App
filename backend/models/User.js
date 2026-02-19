const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "provider", "admin"],
        default: "user"
    },
    serviceType: {   // only for providers
        type: String
    },
    experience: {
        type: Number
    },
    availability: [
        {
            date: String,
            slots: [String]
        }
    ]
},
{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);