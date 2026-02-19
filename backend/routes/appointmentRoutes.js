const express = require("express");
const router = express.Router();

const {
  bookAppointment,
  getMyAppointments,
  markAsSeen,
  markAllAsSeen,
  cancelAppointment,
  completedAppointment,
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

// Complete (both /completed and legacy /complete for backwards compatibility)
router.put("/completed/:id", auth, completedAppointment);
router.put("/complete/:id", auth, completedAppointment);

module.exports = router;