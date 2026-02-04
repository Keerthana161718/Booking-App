const User = require("../models/User");
const Appointment = require("../models/Appointment");

// All users
exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

// All appointments
exports.getAppointments = async (req, res) => {
  const appts = await Appointment.find()
    .populate("user", "name")
    .populate("provider", "name");

  res.json(appts);
};