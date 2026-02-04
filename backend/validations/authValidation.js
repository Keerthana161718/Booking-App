const { body, validationResult } = require("express-validator");

// Handle errors
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }
  next();
};

// Register validation
exports.registerValidation = [
  body("name").notEmpty().withMessage("Name is required"),

  body("email")
    .isEmail()
    .withMessage("Valid email required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be 6+ chars"),

  body("role")
    .isIn(["user", "provider"])
    .withMessage("Role must be user or provider"),

  // If registering as a provider, require a serviceType
  body("serviceType")
    .if(body("role").equals("provider"))
    .notEmpty()
    .withMessage("Service is required for providers"),

  // Optional numeric experience
  body("experience")
    .optional()
    .isNumeric()
    .withMessage("Experience must be a number"),
];

// Login validation
exports.loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Valid email required"),

  body("password")
    .notEmpty()
    .withMessage("Password required"),
];