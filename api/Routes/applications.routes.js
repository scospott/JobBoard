const express = require("express");
const { body, validationResult } = require("express-validator");

const { Application, People, Advertisement } = require("../Models/index");
const { authOptional } = require("../Middlewares/auth.optional");

const router = express.Router();

/**
 * POST /api/applications
 * Cas 1 : utilisateur NON connecté
 *  - advertisement_id
 *  - name
 *  - email
 *  - phone (optionnel)
 *  - message
 *
 * Cas 2 : utilisateur CONNECTÉ (JWT)
 *  - advertisement_id
 *  - message
 */
router.post(
  "/",
  authOptional,
  [
    body("advertisement_id")
      .isInt()
      .withMessage("advertisement_id must be an integer"),

    body("message")
      .isLength({ min: 5 })
      .withMessage("message is too short"),

    // Champs requis uniquement si non connecté
    body("name")
      .custom((value, { req }) => {
        if (req.user) return true;
        return typeof value === "string" && value.trim().length > 1;
      })
      .withMessage("name is required"),

    body("email")
      .custom((value, { req }) => {
        if (req.user) return true;
        return typeof value === "string";
      })
      .withMessage("email is required")
      .bail()
      .optional({ nullable: true })
      .isEmail()
      .withMessage("email must be valid"),

    body("phone")
      .optional()
      .isLength({ min: 6 })
      .withMessage("phone too short"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { advertisement_id, message } = req.body;

      // 1) Vérifier que l'annonce existe
      const ad = await Advertisement.findByPk(advertisement_id);
      if (!ad) {
        return res.status(400).json({ error: "advertisement_id invalid" });
      }

      let person;

      // 2) Cas utilisateur connecté
      if (req.user?.id) {
        person = await People.findByPk(req.user.id);
        if (!person) {
          return res.status(401).json({ error: "Invalid user" });
        }
      }
      // 3) Cas utilisateur non connecté
      else {
        const { name, email, phone } = req.body;

        const [foundOrCreated] = await People.findOrCreate({
          where: { email },
          defaults: {
            name,
            phone: phone ?? null,
          },
        });

        person = foundOrCreated;

        // Mise à jour soft si infos manquantes
        await person.update({
          name: person.name || name,
          phone: person.phone || phone || null,
        });
      }

      // 4) Création de la candidature
      const application = await Application.create({
        people_id: person.id,
        advertisement_id: ad.id,
        message,
        status: "sent",
      });

      return res.status(201).json({ data: application });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
