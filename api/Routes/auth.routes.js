const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const ENV = require("../Config/index");
const { People } = require("../Models/index");
const { authRequired } = require("../Middlewares/auth.middleware");

const router = express.Router();

/**
 * POST /api/auth/register
 * Body:
 * - name
 * - email
 * - phone (optional)
 * - password
 */
router.post(
  "/register",
  [
    body("name").isLength({ min: 2 }).withMessage("name is required"),
    body("email").isEmail().withMessage("email must be valid"),
    body("password").isLength({ min: 6 }).withMessage("password must be at least 6 characters"),
    body("phone").optional().isLength({ min: 6 }).withMessage("phone too short"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, email, phone, password } = req.body;

      const existing = await People.findOne({ where: { email } });
      if (existing) return res.status(400).json({ error: "Email already used" });

      const password_hash = await bcrypt.hash(password, 10);

      const created = await People.create({
        name,
        email,
        phone: phone ?? null,
        password_hash,
        role: "user",
      });

      const token = jwt.sign({ id: created.id, role: created.role }, ENV.JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.status(201).json({
        data: {
          token,
          user: {
            id: created.id,
            name: created.name,
            email: created.email,
            phone: created.phone,
            role: created.role,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/auth/login
 * Body:
 * - email
 * - password
 */
router.post(
  "/login",
  [body("email").isEmail(), body("password").isLength({ min: 1 })],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password } = req.body;

      const user = await People.findOne({ where: { email } });
      if (!user || !user.password_hash) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: "Invalid credentials" });

      const token = jwt.sign({ id: user.id, role: user.role }, ENV.JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.json({
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 */
router.get("/me", authRequired, async (req, res, next) => {
  try {
    const user = await People.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
