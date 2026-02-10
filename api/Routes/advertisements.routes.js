const express = require("express");
const { body, validationResult } = require("express-validator");
const { Advertisement, Company } = require("../Models/index");

const router = express.Router();

// GET /api/advertisements?page=1&limit=10
router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
    const offset = (page - 1) * limit;

    const { rows, count } = await Advertisement.findAndCountAll({
      include: [{ model: Company }],
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    res.json({
      data: rows,
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/advertisements/:id (learn more)
router.get("/:id", async (req, res, next) => {
  try {
    const ad = await Advertisement.findByPk(req.params.id, {
      include: [{ model: Company }],
    });
    if (!ad) return res.status(404).json({ error: "Advertisement not found" });
    res.json({ data: ad });
  } catch (e) {
    next(e);
  }
});

// POST /api/advertisements
router.post(
  "/",
  [
    body("company_id").isInt().withMessage("company_id must be an integer"),
    body("title").isLength({ min: 3 }).withMessage("title too short"),
    body("short_description").isLength({ min: 10 }).withMessage("short_description too short"),
    body("full_description").isLength({ min: 10 }).withMessage("full_description too short"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const company = await Company.findByPk(req.body.company_id);
      if (!company) return res.status(400).json({ error: "company_id invalid" });

      const created = await Advertisement.create({
        company_id: req.body.company_id,
        title: req.body.title,
        short_description: req.body.short_description,
        full_description: req.body.full_description,
        salary: req.body.salary ?? null,
        location: req.body.location ?? null,
        working_time: req.body.working_time ?? null,
      });

      res.status(201).json({ data: created });
    } catch (e) {
      next(e);
    }
  }
);

// PUT /api/advertisements/:id
router.put("/:id", async (req, res, next) => {
  try {
    const ad = await Advertisement.findByPk(req.params.id);
    if (!ad) return res.status(404).json({ error: "Advertisement not found" });

    await ad.update({
      company_id: req.body.company_id ?? ad.company_id,
      title: req.body.title ?? ad.title,
      short_description: req.body.short_description ?? ad.short_description,
      full_description: req.body.full_description ?? ad.full_description,
      salary: req.body.salary ?? ad.salary,
      location: req.body.location ?? ad.location,
      working_time: req.body.working_time ?? ad.working_time,
    });

    res.json({ data: ad });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/advertisements/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const ad = await Advertisement.findByPk(req.params.id);
    if (!ad) return res.status(404).json({ error: "Advertisement not found" });

    await ad.destroy();
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
