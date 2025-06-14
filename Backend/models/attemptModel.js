const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./userModel'); // Required for defining the association
const Paper = require('./paperModel'); // Optional: if you want to link attempts to papers in DB

const Attempt = sequelize.define('Attempt', {
  // Sequelize adds 'id' (INTEGER, autoIncrement, primaryKey) by default
  // userId will be added automatically as a foreign key by the association
  // paperPaperIdString will be added automatically if you associate with Paper
  attemptIdString: { // The unique attempt ID generated by frontend logic
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  duration: { type: DataTypes.INTEGER, allowNull: true },
  answerText: { type: DataTypes.TEXT, allowNull: true },
  fileName: { type: DataTypes.STRING, allowNull: true },
  grade: { type: DataTypes.STRING, allowNull: true },
  score: { type: DataTypes.INTEGER, allowNull: true },
  totalMarks: { type: DataTypes.INTEGER, allowNull: true },
  feedback: { type: DataTypes.TEXT, allowNull: true },
  outline: { type: DataTypes.TEXT, allowNull: true },
  highlight_references: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('highlight_references');
      try {
        return rawValue ? JSON.parse(rawValue) : [];
      } catch (e) {
        return [];
      }
    },
    set(value) {
      this.setDataValue('highlight_references', JSON.stringify(value || []));
    }
  },
  // This field is important if you don't use a direct association to the Paper model
  // and want to store which paper this attempt belongs to.
  paperIdStringForeignKey: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'paperIdString', // Explicitly name the column in the DB
  }
}, {
  tableName: 'attempts',
  timestamps: true,
});

// Define Associations (Relationships)
Attempt.belongsTo(User, {
  foreignKey: 'userId', // This will add 'userId' to the Attempt model/table
  allowNull: false,
});
User.hasMany(Attempt, { // A User can have many Attempts
  foreignKey: 'userId',
});

// Optional: If you want to enforce that paperIdStringForeignKey refers to an actual paper
// This assumes Paper model has paperIdString as its primary key
Attempt.belongsTo(Paper, {
  foreignKey: 'paperIdStringForeignKey', // This foreign key in Attempts
  targetKey: 'paperIdString',     // targets the paperIdString in Papers
  allowNull: false,
  as: 'PaperDetails' // Alias for the association
});
Paper.hasMany(Attempt, {
    foreignKey: 'paperIdStringForeignKey',
    sourceKey: 'paperIdString'
});


module.exports = Attempt;