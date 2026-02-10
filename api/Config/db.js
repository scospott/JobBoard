const { Sequelize } = require("sequelize");
const ENV = require("./index");

const db = new Sequelize(ENV.DB_NAME, ENV.DB_USER, ENV.DB_PASSWORD, {
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  dialect: ENV.DB_DIALECT,
  logging: false,
});

async function testConnection() {
  console.log("Tentative de connexion MySQL...");
  await db.authenticate();
  console.log("✅ Connexion MySQL OK");
}

module.exports = { db, testConnection };
