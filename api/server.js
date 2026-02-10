const express = require("express");
const cors = require("cors");
const ENV = require("./Config/index");
const { db, testConnection } = require("./Config/db");

// IMPORTANT: charge les models + associations
require("./Models/index");

const app = express();
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
app.use(express.json());

// Healthcheck
app.get("/api/health", (req, res) => res.json({ message: "JobBoard API OK" }));

// Routes (Step04)
app.use("/api/advertisements", require("./Routes/advertisements.routes"));
app.use("/api/companies", require("./Routes/companies.routes"));

// (on ajoutera auth, people, applications après)

// Error handler simple
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

async function startServer() {
  try {
    await testConnection();
    await db.sync({ force: false });
    console.log("✅ Tables synchronisées");

    app.listen(ENV.PORT, () => {
      console.log(`✅ Server running on http://localhost:${ENV.PORT}`);
    });
  } catch (e) {
    console.error("❌ Server not started:", e.message);
    process.exit(1);
  }
}

startServer();
