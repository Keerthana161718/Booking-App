const { body } = require("express-validator");

exports.paymentValidation = [
  body("amount").isNumeric().withMessage("Amount must be number"),
  body("method").notEmpty().withMessage("Payment method required"),
];