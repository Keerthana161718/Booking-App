const { body } = require("express-validator");

exports.bookValidation = [
  body("provider")
    .notEmpty()
    .withMessage("Provider id is required")
    .isMongoId()
    .withMessage("Invalid provider id"),
  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be in ISO format (YYYY-MM-DD)"),
  body("time")
    .notEmpty()
    .withMessage("Time is required")
    .matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Time must be in HH:MM format"),
];
