const express = require("express");
const router = express.Router();
const jobsController = require("../Controllers/jobs.controllers");

router.get("/getAllJobs", jobsController.getAllJobs);

module.exports = router;
