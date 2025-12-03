import { Sequelize } from 'sequelize';

// Using SQLite for easier local setup
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // This will create a file in your project root
  logging: false,
});

export default sequelize;
