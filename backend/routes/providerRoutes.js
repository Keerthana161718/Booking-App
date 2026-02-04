const express = require("express");
const router = express.Router();

const {
  getProviders,
  getProvider,
  updateAvailability,
} = require("../Controllers/providerController");

const auth = require("../middleware/authMiddleware");

const {
  availabilityValidation,
} = require("../validations/providerValidation");

const { validate } = require("../validations/authValidation");

// Public
router.get("/", getProviders);
router.get("/:id", getProvider);

// Provider update
router.put(
  "/availability",
  auth,
  availabilityValidation,
  validate,
  updateAvailability
);

module.exports = router;