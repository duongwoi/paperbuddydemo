const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Paper = sequelize.define('Paper', {
  paperIdString: { // e.g., 'econ-9708-21-mj-23'
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true, // Make this the primary key for papers table
  },
  subjectId: { type: DataTypes.STRING, allowNull: false },
  subjectCode: { type: DataTypes.STRING, allowNull: false },
  subjectName: { type: DataTypes.STRING, allowNull: false },
  paperNumber: { type: DataTypes.STRING, allowNull: false },
  variant: { type: DataTypes.STRING, allowNull: false },
  sessionCode: { type: DataTypes.STRING, allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false },
  shortYear: { type: DataTypes.STRING },
  sessionLabel: { type: DataTypes.STRING },
  totalMarks: { type: DataTypes.INTEGER, allowNull: false },
  pdfPath: { type: DataTypes.STRING },
}, {
  tableName: 'papers',
  timestamps: true,
});

module.exports = Paper;