const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
    // admin login removed - continue with normal user/provider auth flow
    // (no special-case admin handling) 

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


/* =========================
   PROFILE ENDPOINTS
========================= */

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    // req.user is populated by auth middleware (without password)
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update current user profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, phone, serviceType, experience } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (serviceType !== undefined) user.serviceType = serviceType;
    if (experience !== undefined) user.experience = experience;

    await user.save();

    // Return a refreshed token so client can reflect updated name in JWT payload
    const token = generateToken(user._id, user.role, user.name);

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, serviceType: user.serviceType, experience: user.experience } });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};