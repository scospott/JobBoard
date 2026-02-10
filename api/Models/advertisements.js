const { DataTypes } = require("sequelize");
const { db } = require("../Config/db");

const Advertisement = db.define(
  "Advertisement",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    title: { type: DataTypes.STRING(160), allowNull: false },
    short_description: { type: DataTypes.STRING(300), allowNull: false },
    full_description: { type: DataTypes.TEXT, allowNull: false },

    salary: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    location: { type: DataTypes.STRING(120), allowNull: true },
    working_time: { type: DataTypes.STRING(80), allowNull: true },
  },
  {
    tableName: "advertisements",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Advertisement;
