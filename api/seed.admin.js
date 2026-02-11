const bcrypt = require("bcrypt");
const { People } = require("./Models/index");

// ...
const adminPass = await bcrypt.hash("Admin2026!", 10);

await People.create({
  name: "Admin",
  email: "admin@jobboard.test",
  phone: "0000000000",
  password_hash: adminPass,
  role: "admin",
});