const express = require("express");
const router = express.Router();

const {
  bookAppointment,
  getMyAppointments,
  markAsSeen,
  markAllAsSeen,
  cancelAppointment,
} = require("../Controllers/appointmentController");

const auth = require("../middleware/authMiddleware");

const {
  bookValidation,
} = require("../validations/appointmentValidation");

const { validate } = require("../validations/authValidation");

// Book
router.post("/book", auth, bookValidation, validate, bookAppointment);

// My appointments
router.get("/my", auth, getMyAppointments);

// Mark seen
router.put("/seen/:id", auth, markAsSeen);
router.put("/seen-all", auth, markAllAsSeen);

// Cancel
router.put("/cancel/:id", auth, cancelAppointment);

module.exports = router;