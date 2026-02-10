const { DataTypes } = require("sequelize");
const { db } = require("../Config/db");

const Application = db.define(
  "Application",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    message: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM("sent", "reviewed", "rejected", "accepted"),
      allowNull: false,
      defaultValue: "sent",
    },
  },
  {
    tableName: "applications",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Application;
