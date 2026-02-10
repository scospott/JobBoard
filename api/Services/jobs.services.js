
exports.allJobs = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM Jobs", (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};