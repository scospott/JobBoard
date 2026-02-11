const jwt = require("jsonwebtoken");
const ENV = require("../Config/index");

function authOptional(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type === "Bearer" && token) {
    try {
      const payload = jwt.verify(token, ENV.JWT_SECRET);
      req.user = payload;
    } catch (_) {
      // token invalide => on ignore, on reste "non connecté"
    }
  }
  next();
}

module.exports = { authOptional };
