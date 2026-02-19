const { body } = require("express-validator");

// Expect availability to be an array of objects (optional)
exports.availabilityValidation = [
  body("availability").optional().isArray().withMessage("Availability must be an array"),
  // further validation could check shape of items if needed
];
