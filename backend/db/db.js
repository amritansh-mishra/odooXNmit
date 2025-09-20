const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize (MySQL)
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST || 'localhost',
    dialect: 'mysql',
    logging: process.env.SEQUELIZE_LOGGING === 'true' ? console.log : false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  }
);

// Connect and sync models
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection established successfully.');

    // Ensure models are loaded BEFORE sync
    require('../models');

    // Sync all models (consider migrations for production)
    await sequelize.sync({ alter: true });
    console.log('✅ Sequelize models synchronized successfully.');

    return sequelize;
  } catch (error) {
    console.error('❌ Unable to connect to MySQL:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await sequelize.close();
    console.log('MySQL connection closed gracefully.');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MySQL connection:', error);
    process.exit(1);
  }
});

module.exports = { sequelize, connectDB };