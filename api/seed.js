// seed.js
const { db, testConnection } = require("./Config/db");
const { Company, Advertisement } = require("./Models/index");

async function seed() {
  try {
    await testConnection();
    await db.sync({ force: false });

    // Nettoyage (optionnel mais pratique en dev)
    await Advertisement.destroy({ where: {} });
    await Company.destroy({ where: {} });

    const companies = await Company.bulkCreate([
      { name: "Ascione Gourmet", location: "Annecy", email: "contact@ascione-gourmet.test" },
      { name: "Geneva Tech", location: "Genève", email: "hr@geneva-tech.test" },
    ]);

    await Advertisement.bulkCreate([
      {
        company_id: companies[0].id,
        title: "Serveur / Serveuse",
        short_description: "Service en salle, ambiance italienne, équipe dynamique.",
        full_description:
          "Tu assures le service en salle, l’accueil des clients, la prise de commandes et l’encaissement. Expérience appréciée. Travail le soir et week-end.",
        salary: 2100,
        location: "Annecy",
        working_time: "Temps plein",
      },
      {
        company_id: companies[0].id,
        title: "Commis de cuisine",
        short_description: "Préparation des entrées, mise en place, hygiène HACCP.",
        full_description:
          "Mise en place, préparation des entrées, aide au dressage, respect strict des normes d’hygiène. Formation possible.",
        salary: 2000,
        location: "Annecy",
        working_time: "Temps plein",
      },
      {
        company_id: companies[1].id,
        title: "Développeur Full-Stack Junior",
        short_description: "Node.js + SQL + HTML/CSS/JS, API REST, bonnes pratiques.",
        full_description:
          "Développement et maintenance d’une API REST Node.js, intégration front simple, tests manuels, documentation. Notions Docker appréciées.",
        salary: 4200,
        location: "Genève",
        working_time: "Temps plein",
      },
      {
        company_id: companies[1].id,
        title: "Data Analyst (Stage)",
        short_description: "Exploration de données, dashboards, SQL, Python.",
        full_description:
          "Analyse exploratoire, requêtes SQL, préparation de tableaux de bord, reporting hebdo. Python/pandas apprécié.",
        salary: 1800,
        location: "Genève",
        working_time: "Stage",
      },
      {
        company_id: companies[1].id,
        title: "Support IT (Helpdesk)",
        short_description: "Support utilisateurs, tickets, matériel, Windows/Mac.",
        full_description:
          "Support N1/N2, gestion de tickets, préparation de postes, dépannage réseau basique. Sens du service.",
        salary: 3200,
        location: "Genève",
        working_time: "Temps plein",
      },
    ]);

    console.log("✅ Seed terminé : companies + advertisements insérés.");
    process.exit(0);
  } catch (e) {
    console.error("❌ Seed error:", e.message);
    process.exit(1);
  }
}

seed();
