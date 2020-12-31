const mysql = require('mysql')

const mysqlLoader = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ProjetMusical"
});

module.exports = mysqlLoader