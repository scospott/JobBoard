const express = require("express");
const { Company } = require("../Models/index");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const rows = await Company.findAll({ order: [["created_at", "DESC"]] });
    res.json({ data: rows });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const row = await Company.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Company not found" });
    res.json({ data: row });
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const created = await Company.create({
      name: req.body.name,
      location: req.body.location ?? null,
      email: req.body.email ?? null,
    });
    res.status(201).json({ data: created });
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const row = await Company.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Company not found" });

    await row.update({
      name: req.body.name ?? row.name,
      location: req.body.location ?? row.location,
      email: req.body.email ?? row.email,
    });

    res.json({ data: row });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const row = await Company.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Company not found" });

    await row.destroy();
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
