const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET /api/debug/db
router.get('/db', async (req, res) => {
  try {
    const state = mongoose.connection.readyState; // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting

    // Try a lightweight DB operation if connected
    let userCount = null;
    if (state === 1) {
      try {
        userCount = await User.estimatedDocumentCount();
      } catch (e) {
        userCount = `count error: ${e.message}`;
      }
    }

    res.json({
      ok: true,
      mongooseState: state,
      userCount,
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// POST /api/debug/reset-admin - Reset admin password (use with caution)
router.post('/reset-admin', async (req, res) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'keerthu@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Keerthu@123';
    const adminName = process.env.ADMIN_NAME || 'Administrator';

    // Find or create admin
    let admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      // Try to find by email and upgrade
      admin = await User.findOne({ email: adminEmail });
      if (!admin) {
        // Create new
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        admin = new User({
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: 'admin'
        });
      } else {
        // Upgrade existing user
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(adminPassword, salt);
        admin.role = 'admin';
      }
    } else {
      // Update password for existing admin
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(adminPassword, salt);
    }

    await admin.save();
    res.json({ 
      ok: true, 
      message: `Admin reset successfully. Email: ${admin.email}` 
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;
