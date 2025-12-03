import sequelize from './db/db.js';
import { User } from './db/models.js';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Sync to ensure table exists
    await sequelize.sync();

    const username = 'admin';
    const password = 'admin123';

    // Check if admin exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      console.log('Admin user already exists.');
      // Optional: Update password if needed
      // const hashedPassword = await bcrypt.hash(password, 10);
      // existingUser.password = hashedPassword;
      // await existingUser.save();
      // console.log('Admin password reset.');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        username,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created successfully.');
    }

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

createAdmin();
