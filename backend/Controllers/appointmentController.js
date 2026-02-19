const Appointment = require("../models/Appointment");

// Book appointment
exports.bookAppointment = async (req, res) => {
  try {
    // ensure the appointment has the authenticated user
    req.body.user = req.user.id;
    const appt = await Appointment.create(req.body);
    res.json(appt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get my appointments
exports.getMyAppointments = async (req, res) => {
  try {
    let query;
    if (req.user.role === 'provider') {
      // provider should see bookings assigned to them
      query = { provider: req.user.id };
    } else {
      // regular user sees their own bookings
      query = { user: req.user.id };
    }

    const data = await Appointment.find(query)
      .populate('provider', 'name serviceType')
      .populate('user', 'name email phone');

    res.json(data);
  } catch (err) {
    console.error('getMyAppointments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark appointment as seen by provider
exports.markAsSeen = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if(!appt) return res.status(404).json({ message: 'Appointment not found' });
    if(String(appt.provider) !== String(req.user.id)) return res.status(403).json({ message: 'Not authorized' });

    appt.seenByProvider = true;
    await appt.save();
    res.json({ msg: 'Marked as seen' });
  } catch (err) {
    console.error('markAsSeen error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all as seen for provider
exports.markAllAsSeen = async (req, res) => {
  try {
    await Appointment.updateMany({ provider: req.user.id, seenByProvider: false }, { seenByProvider: true });
    res.json({ msg: 'All marked' });
  } catch (err) {
    console.error('markAllAsSeen error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel
exports.cancelAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if(!appt) return res.status(404).json({ message: 'Appointment not found' });
    if(String(appt.user) !== String(req.user.id) && String(appt.provider) !== String(req.user.id)) return res.status(403).json({ message: 'Not authorized' });
    if(appt.status === 'completed') return res.status(400).json({ message: 'Cannot cancel a completed appointment' });

    appt.status = 'cancelled';
    appt.seenByProvider = true;
    await appt.save();

    console.log(`[appointments] cancelled ${appt._id} by ${req.user.id}`);
    res.json({ msg: 'Cancelled' });
  } catch (err) {
    console.error('cancelAppointment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.completedAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if(!appt) return res.status(404).json({ message: 'Appointment not found' });
    if(String(appt.provider) !== String(req.user.id)) return res.status(403).json({ message: 'Not authorized' });
    if(appt.status === 'cancelled') return res.status(400).json({ message: 'Cannot complete a cancelled appointment' });

    appt.status = 'completed';
    appt.seenByProvider = true;
    await appt.save();

    console.log(`[appointments] completed ${appt._id} by ${req.user.id}`);
    res.json({ msg: 'Completed' });
  } catch (err) {
    console.error('completedAppointment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};