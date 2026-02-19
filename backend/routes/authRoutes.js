const express = require("express");
const router = express.Router();

const { register, login, getProfile, updateProfile } = require("../Controllers/authController");
const auth = require("../middleware/authMiddleware");
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  validate,
} = require("../validations/authValidation");

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);

// Profile
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfileValidation, validate, updateProfile);

module.exports = router;