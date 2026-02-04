const { body } = require("express-validator");

exports.availabilityValidation = [
  body("availability").isArray().withMessage("Availability must be array"),
];