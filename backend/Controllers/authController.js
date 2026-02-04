const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ADMIN_USERNAME, ADMIN_PASSWORD } = require('../config/adminConfig');

// Generate JWT
const generateToken = (id, role, name) => {
  const payload = { id, role };
  if (name) payload.name = name;
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// REGISTER (user/provider only)
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, serviceType, experience } = req.body;

    if (!["user", "provider"].includes(role))
      return res.status(400).json({ msg: "Invalid role" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "User exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      serviceType,
      experience,
    });

    res.json({
      token: generateToken(user._id, user.role, user.name),
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN (includes Admin)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // ADMIN LOGIN - only the hard-coded credentials in config/adminConfig.js are accepted
    if (typeof email === 'string' && ADMIN_USERNAME) {
      const input = email.trim().toLowerCase();
      const adminName = ADMIN_USERNAME.trim().toLowerCase();
      const matchAdmin = input === adminName;
      console.info(`Admin login attempt for identifier: "${email}" -> match:${matchAdmin}`);

      if (matchAdmin && password === ADMIN_PASSWORD) {
        // return a valid JWT for admin so the frontend can set auth state
        return res.json({
          token: generateToken('admin', 'admin', 'Administrator'),
          role: "admin",
          message: "Admin login success",
        });
      }
    }

    // allow login by email or username (case-insensitive exact match)
    const identifier = (email || '').trim();
    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('^' + escapeRegex(identifier) + '$', 'i');

    const user = await User.findOne({ $or: [{ email: re }, { name: re }] });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Wrong password" });

    res.json({
      token: generateToken(user._id, user.role, user.name),
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};