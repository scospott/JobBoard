const jobsService = require("../Services/jobs.service");

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await jobsService.allJobs();
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500);
    res.send("erreur serveur");
  }
};
