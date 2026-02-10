const CompaniesServices = require("../Services/companies.services")

exports.getAllCompanies = async (req, res) =>{
    try{
        const companies = await CompaniesServices.getAllCompanies();
        res.json(companies)
    }catch (error){
        console.error(error);
        res.status(500);
        res.send("erreur serveur");
    }

}