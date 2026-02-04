const { body } = require("express-validator");

exports.bookValidation = [
  body("provider").notEmpty().withMessage("Provider required"),
  body("date").notEmpty().withMessage("Date required"),
  body("time").notEmpty().withMessage("Time required"),
];