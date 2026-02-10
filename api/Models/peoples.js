const { DataTypes } = require("sequelize");
const { db } = require("../Config/db");

const People = db.define(
  "People",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(180), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(40), allowNull: true },

    password_hash: { type: DataTypes.STRING(255), allowNull: true }, // Step06
    role: { type: DataTypes.ENUM("user", "admin"), allowNull: false, defaultValue: "user" },
  },
  {
    tableName: "people",
    timestamps: true,
    underscored: true,
  }
);

module.exports = People;
