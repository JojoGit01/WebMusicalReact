class SelectRouteService {

    constructor(mysqlConnection) {
        this.mysqlConnection = mysqlConnection
    }

    getQuery(querySelect, res) {
        this.mysqlConnection.query(querySelect, (err, result) => {
            res.send(result)
        })
    }
}

module.exports = SelectRouteService