const bcrypt = require("bcryptjs");

// Hash password
exports.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password
exports.comparePassword = async (entered, stored) => {
  return await bcrypt.compare(entered, stored);
};