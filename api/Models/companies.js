const { DataTypes } = require("sequelize");
const { db } = require("../Config/db");

const Company = db.define(
  "Company",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    location: { type: DataTypes.STRING(120), allowNull: true },
    email: { type: DataTypes.STRING(180), allowNull: true, unique: true },
  },
  {
    tableName: "companies",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Company;
