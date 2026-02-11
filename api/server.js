const express = require("express");
const cors = require("cors");
const path = require("path");

const ENV = require("./Config/index");
const { db, testConnection } = require("./Config/db");

// charge models + associations
require("./Models/index");

const app = express(); // ✅ IMPORTANT : app doit être initialisé AVANT app.use()

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Serve front (public/)
app.use(express.static(path.join(__dirname, "public")));

// Healthcheck API (ne pas utiliser "/" sinon conflit avec index.html)
app.get("/api/health", (req, res) => {
  res.json({ message: "JobBoard API OK" });
});

// Routes API
app.use("/api/advertisements", require("./Routes/advertisements.routes"));
app.use("/api/companies", require("./Routes/companies.routes"));
app.use("/api/applications", require("./Routes/applications.routes"));
app.use("/api/auth", require("./Routes/auth.routes"));
app.use("/api/admin", require("./Routes/admin.routes"));

// Error handler central
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

async function startServer() {
  try {
    await testConnection();
    await db.sync({ force: false });
    console.log("✅ Tables synchronisées");

    app.listen(ENV.PORT, () => {
      console.log(`✅ Server running on http://localhost:${ENV.PORT}`);
      console.log(`✅ Front: http://localhost:${ENV.PORT}/`);
      console.log(`✅ API Health: http://localhost:${ENV.PORT}/api/health`);
    });
  } catch (e) {
    console.error("❌ Server not started:", e.message);
    process.exit(1);
  }
}

startServer();
