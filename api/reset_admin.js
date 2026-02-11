require("dotenv").config();

const bcrypt = require("bcrypt");

// ✅ chemins corrects car le script est dans /api
const { People } = require("./Models/index");
const { db } = require("./Config/db");

(async () => {
  try {
    await db.authenticate();

    const email = "admin@jobboard.test";
    const password = "Admin2026!";

    const password_hash = await bcrypt.hash(password, 10);

    const [admin, created] = await People.findOrCreate({
      where: { email },
      defaults: {
        name: "Admin",
        email,
        phone: "0000000000",
        role: "admin",
        password_hash,
      },
    });

    if (!created) {
      await admin.update({ password_hash, role: "admin" });
    }

    console.log("✅ Admin prêt");
    console.log("email:", email);
    console.log("password:", password);

    process.exit(0);
  } catch (e) {
    console.error("❌ Error:", e);
    process.exit(1);
  }
})();
