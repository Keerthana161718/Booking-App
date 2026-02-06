const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/adminController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// All admin routes require auth + admin role
router.get('/users', auth, role('admin'), adminController.getUsers);
router.get('/appointments', auth, role('admin'), adminController.getAppointments);
router.delete('/users/:id', auth, role('admin'), adminController.deleteUser);

module.exports = router;