const User = require("../models/User");

// Get all providers (supports filtering by serviceType/speciality and text search)
exports.getProviders = async (req, res) => {
  try {
    const { serviceType, speciality, search, contact, country } = req.query;
    const filter = { role: "provider" };

    if (serviceType || speciality) filter.serviceType = serviceType || speciality;
    if (country) filter.country = country;

    // Build $or conditions for textual search (name, serviceType, email, phone)
    const or = [];
    if (search) {
      const s = new RegExp(search, "i");
      or.push({ name: s }, { serviceType: s }, { email: s }, { phone: s });
    }
    if (contact) {
      const c = new RegExp(contact, "i");
      or.push({ email: c }, { phone: c });
    }
    if (or.length) filter.$or = or;

    const providers = await User.find(filter);
    res.json(providers);
  } catch (err) {
    console.error("getProviders error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single provider by id
exports.getProvider = async (req, res) => {
  try {
    const id = req.params.id;
    const provider = await User.findById(id).lean();
    if (!provider || provider.role !== 'provider') return res.status(404).json({ message: 'Provider not found' });
    res.json(provider);
  } catch (err) {
    console.error('getProvider error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update availability
exports.updateAvailability = async (req, res) => {
  const provider = await User.findById(req.user.id);
  provider.availability = req.body.availability;
  await provider.save();

  res.json({ msg: "Updated" });
};