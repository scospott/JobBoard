const express = require("express");
const { authRequired, adminOnly } = require("../Middlewares/auth.middleware");
const { Company, Advertisement, People, Application } = require("../Models/index");

const router = express.Router();

router.use(authRequired, adminOnly);

function parsePage(req) {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// Generic list helper
async function list(model, req, res, options = {}) {
  const { page, limit, offset } = parsePage(req);

  const { rows, count } = await model.findAndCountAll({
    ...options,
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });

  res.json({
    data: rows,
    pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
  });
}

/* ===== COMPANIES ===== */
router.get("/companies", (req, res) => list(Company, req, res));
router.post("/companies", async (req, res) => {
  const created = await Company.create({
    name: req.body.name,
    location: req.body.location ?? null,
    email: req.body.email ?? null,
  });
  res.status(201).json({ data: created });
});
router.put("/companies/:id", async (req, res) => {
  const row = await Company.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: "Company not found" });
  await row.update({
    name: req.body.name ?? row.name,
    location: req.body.location ?? row.location,
    email: req.body.email ?? row.email,
  });
  res.json({ data: row });
});
router.delete("/companies/:id", async (req, res) => {
  const row = await Company.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: "Company not found" });
  await row.destroy();
  res.status(204).send();
});

/* ===== ADVERTISEMENTS ===== */
router.get("/advertisements", (req, res) =>
  list(Advertisement, req, res, { include: [{ model: Company }] })
);
router.post("/advertisements", async (req, res) => {
  try {
    const company_id = Number(req.body.company_id);

    if (!Number.isInteger(company_id)) {
      return res.status(400).json({ error: "company_id doit être un entier (ex: 1, 2)" });
    }

    const company = await Company.findByPk(company_id);
    if (!company) {
      return res.status(400).json({ error: `company_id invalide: aucune company avec id=${company_id}` });
    }

    if (!req.body.title || !req.body.short_description || !req.body.full_description) {
      return res.status(400).json({ error: "Champs requis: title, short_description, full_description" });
    }

    const created = await Advertisement.create({
      company_id,
      title: req.body.title,
      short_description: req.body.short_description,
      full_description: req.body.full_description,
      salary: req.body.salary ?? null,
      location: req.body.location ?? null,
      working_time: req.body.working_time ?? null,
    });

    res.status(201).json({ data: created });
  } catch (e) {
    console.error("POST /admin/advertisements error:", e);

    // erreurs Sequelize connues => message lisible
    if (e.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({ error: "company_id ne correspond à aucune entreprise existante" });
    }
    if (e.name === "SequelizeValidationError") {
      return res.status(400).json({ error: e.errors.map((x) => x.message).join(", ") });
    }

    res.status(500).json({ error: "Erreur création advertisement" });
  }
});

router.put("/advertisements/:id", async (req, res) => {
  const row = await Advertisement.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: "Advertisement not found" });
  await row.update({
    company_id: req.body.company_id ?? row.company_id,
    title: req.body.title ?? row.title,
    short_description: req.body.short_description ?? row.short_description,
    full_description: req.body.full_description ?? row.full_description,
    salary: req.body.salary ?? row.salary,
    location: req.body.location ?? row.location,
    working_time: req.body.working_time ?? row.working_time,
  });
  res.json({ data: row });
});
router.delete("/advertisements/:id", async (req, res) => {
  const row = await Advertisement.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: "Advertisement not found" });
  await row.destroy();
  res.status(204).send();
});

/* ===== PEOPLE (LIST ONLY + DELETE optional) ===== */
router.get("/people", (req, res) => list(People, req, res));
router.put("/people/:id", async (req, res) => {
  const row = await People.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: "People not found" });
  await row.update({
    name: req.body.name ?? row.name,
    email: req.body.email ?? row.email,
    phone: req.body.phone ?? row.phone,
    role: req.body.role ?? row.role,
  });
  res.json({ data: row });
});
router.delete("/people/:id", async (req, res) => {
  const row = await People.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: "People not found" });
  await row.destroy();
  res.status(204).send();
});

/* ===== APPLICATIONS ===== */
router.get("/applications", (req, res) =>
  list(Application, req, res, { include: [{ model: People }, { model: Advertisement }] })
);
router.put("/applications/:id", async (req, res) => {
  const row = await Application.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: "Application not found" });
  await row.update({
    status: req.body.status ?? row.status,
    message: req.body.message ?? row.message,
  });
  res.json({ data: row });
});
router.delete("/applications/:id", async (req, res) => {
  const row = await Application.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: "Application not found" });
  await row.destroy();
  res.status(204).send();
});

module.exports = router;
