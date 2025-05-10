// File: PaperBuddy FInal/Backend/config/db.js
const { Sequelize } = require('sequelize');
const path = require('path');

// Determine the path for the SQLite database file
// It will be created if it doesn't exist.
// Default location is now 'Backend/paperbuddy_default.db' if SQLITE_DB_PATH is not in .env
const defaultDbPath = path.join(__dirname, '..', 'paperbuddy_default.db'); // '..' goes up from 'config' to 'Backend'
const dbPath = process.env.SQLITE_DB_PATH || defaultDbPath;

// Resolve the path to an absolute path for clarity in logging and for Sequelize
const absoluteDbPath = path.resolve(dbPath);
console.log(`SQLite database will be initialized at: ${absoluteDbPath}`);

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: absoluteDbPath, // Use the absolute path to the database file
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

const connectDBAndSync = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite connection has been established successfully.');

    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully with the SQLite database.');

  } catch (error) {
    console.error('Unable to connect to the SQLite database or sync models:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDBAndSync };