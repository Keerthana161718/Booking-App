const User = require('../models/User');
const bcrypt = require('bcryptjs');

module.exports = async function ensureAdmin(){
  try{
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Administrator';

    // Check if admin credentials are configured
    if (!adminEmail || !adminPassword) {
      console.warn('⚠️ ADMIN_EMAIL and ADMIN_PASSWORD environment variables are not set');
      console.warn('⚠️ Please set them in your .env file before running the server');
      return;
    }

    // Prefer existing admin by role
    let existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      // Verify password is correct, if not update it
      const isPasswordCorrect = await bcrypt.compare(adminPassword, existingAdmin.password);
      if (!isPasswordCorrect) {
        const salt = await bcrypt.genSalt(10);
        existingAdmin.password = await bcrypt.hash(adminPassword, salt);
        await existingAdmin.save();
        console.log('🔄 Admin password updated from environment variables');
      }
      return;
    }

    // If no admin by role, check if a user exists with the configured admin email
    let userByEmail = await User.findOne({ email: adminEmail });
    if (userByEmail) {
      userByEmail.role = 'admin';
      // update password to configured one
      const salt = await bcrypt.genSalt(10);
      userByEmail.password = await bcrypt.hash(adminPassword, salt);
      await userByEmail.save();
      console.log(`✅ Existing user ${adminEmail} upgraded to admin`);
      return;
    }

    // Create a new admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    const admin = new User({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log(`✅ Admin user created: ${adminEmail}`);
  }catch(err){
    console.error('ensureAdmin error:', err);
  }
};