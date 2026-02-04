const express = require("express");
const router = express.Router();

const { register, login } = require("../Controllers/authController");
const {
  registerValidation,
  loginValidation,
  validate,
} = require("../validations/authValidation");

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);

module.exports = router;