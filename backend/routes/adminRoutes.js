const express = require("express");
const router = express.Router();
const {
  getUsers,
  getAppointments,
} = require("../Controllers/adminController");

// You can later add admin middleware check
router.get("/users", getUsers);
router.get("/appointments", getAppointments);

module.exports = router;