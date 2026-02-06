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

  body("email").isEmail().withMessage("Valid email required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be 6+ chars"),

  body("role").isIn(["user", "provider"]).withMessage("Role must be user or provider"),

  // If registering as a provider, require a serviceType
  body("serviceType")
    .if(body("role").equals("provider"))
    .notEmpty()
    .withMessage("Service is required for providers"),

  // Optional numeric experience
  body("experience").optional().isNumeric().withMessage("Experience must be a number"),
];

// Login validation
exports.loginValidation = [
  body("email").isEmail().withMessage("Valid email required"),

  body("password").notEmpty().withMessage("Password required"),
];

// Update profile validation
// Allow partial updates: make `name` optional so users can update phone/service alone
exports.updateProfileValidation = [
  body("name").optional().notEmpty().withMessage("Name is required"),
  // Accept common phone formats (digits, spaces, +, -, parentheses) or allow empty string to clear
  body("phone").optional().custom((val) => {
    // allow empty string to clear phone
    if (val === '') return true;
    if (typeof val !== 'string') return false;
    const trimmed = val.trim();
    // accept 7-20 chars composed of digits, spaces, plus, hyphen, parentheses
    return /^[0-9+\-() ]{7,20}$/.test(trimmed);
  }).withMessage("Invalid phone number"),
  body("serviceType")
    .if((value, { req }) => req.user && req.user.role === "provider")
    .notEmpty()
    .withMessage("Service is required for providers"),
  body("experience").optional().isNumeric().withMessage("Experience must be a number"),
];
