const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');

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

module.exports = router;
