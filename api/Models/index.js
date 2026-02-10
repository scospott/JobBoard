const Company = require("./companies");
const Advertisement = require("./advertisements");
const People = require("./peoples");
const Application = require("./applications");

// Relations
Company.hasMany(Advertisement, { foreignKey: { name: "company_id", allowNull: false } });
Advertisement.belongsTo(Company, { foreignKey: { name: "company_id", allowNull: false } });

Advertisement.hasMany(Application, { foreignKey: { name: "advertisement_id", allowNull: false } });
Application.belongsTo(Advertisement, { foreignKey: { name: "advertisement_id", allowNull: false } });

People.hasMany(Application, { foreignKey: { name: "people_id", allowNull: false } });
Application.belongsTo(People, { foreignKey: { name: "people_id", allowNull: false } });

module.exports = { Company, Advertisement, People, Application };
