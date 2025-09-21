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

    // Use force: false and alter: false to avoid recreating indexes
    // This prevents the "too many keys" error
    await sequelize.sync({ 
      force: false,  // Don't drop and recreate tables
      alter: false   // Don't alter existing table structure
    });
    console.log('✅ Sequelize models synchronized successfully.');

    return sequelize;
  } catch (error) {
    console.error('❌ Unable to connect to MySQL:', error.message);
    
    // If sync fails due to table structure, try without sync
    if (error.message.includes('Too many keys') || error.message.includes('max 64 keys')) {
      console.log('⚠️ Skipping table sync due to index limitations. Please run the database migration script manually.');
      return sequelize;
    }
    
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