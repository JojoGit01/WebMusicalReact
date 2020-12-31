const jwt = require("jsonwebtoken");
const mysqlConnection = require('../loaders/mysql')

module.exports = async function(req, res, next) {
    const token = req.header("token");
    if (!token) return res.status(401).json({ message: "Auth Error" });
    
    try {
        const decoded = jwt.verify(token, "randomString");
        req.user = decoded.user;
        //mysqlConnection.query(`SELECT * FROM comptemusical WHERE emailC='${req.user.emailC}'`, (err, result) => {res.status(200).send(result)})
        next();
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Invalid Token" });
    }
};