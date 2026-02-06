const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { comparePassword } = require('../utils/hashPassword');

// List all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('getUsers error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// List all appointments
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('user', 'name email role')
      .populate('provider', 'name email role');
    res.json(appointments);
  } catch (err) {
    console.error('getAppointments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a user (or provider) and their related appointments
exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { adminPassword } = req.body;

    if (!adminPassword) return res.status(400).json({ message: 'Admin password required' });

    // verify admin password (req.user is set by auth middleware)
    const adminUser = await User.findById(req.user.id);
    if (!adminUser) return res.status(401).json({ message: 'Admin not found' });

    const matched = await comparePassword(adminPassword, adminUser.password);
    if (!matched) return res.status(401).json({ message: 'Invalid admin password' });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin user' });

    // If provider, prevent deletion when there are future (non-cancelled) appointments
    if (user.role === 'provider') {
      const today = new Date().toISOString().slice(0,10); // YYYY-MM-DD
      const future = await Appointment.findOne({ provider: id, status: { $ne: 'cancelled' }, date: { $gte: today } });
      if (future) return res.status(400).json({ message: 'Provider has future appointments' });
    }

    await User.findByIdAndDelete(id);
    await Appointment.deleteMany({ $or: [{ user: id }, { provider: id }] });

    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('deleteUser error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};