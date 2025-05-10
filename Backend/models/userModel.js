const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // Import the sequelize instance
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  // Sequelize adds 'id' by default: INTEGER, autoIncrement, primaryKey
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Ensure emails are unique
    validate: {
      isEmail: true, // Sequelize built-in email validation
    },
  },
  passwordHash: { // Store the hashed password
    type: DataTypes.STRING,
    allowNull: false,
  },
  subjects: {
    // SQLite doesn't have a native array type. Store as JSON string.
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]', // Default to an empty array string
    get() {
      const rawValue = this.getDataValue('subjects');
      try {
        return rawValue ? JSON.parse(rawValue) : [];
      } catch (e) {
        console.error("Error parsing subjects JSON for user:", this.id, rawValue);
        return []; // Return empty array on parse error
      }
    },
    set(value) {
      if (Array.isArray(value)) {
        this.setDataValue('subjects', JSON.stringify(value));
      } else if (typeof value === 'string') {
        // If it's already a string, assume it's valid JSON or empty array string
        this.setDataValue('subjects', value || '[]');
      } else {
        this.setDataValue('subjects', '[]');
      }
    }
  }
  // Sequelize automatically adds createdAt and updatedAt columns
}, {
  // Model options
  tableName: 'users', // Optional: explicitly define the table name
});

// Instance method to check password (add this to the User model)
User.prototype.matchPassword = async function (enteredPassword) {
  // 'this' refers to the user instance
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = User;