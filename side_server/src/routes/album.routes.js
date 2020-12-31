const router = require('express').Router()

const mysqlConnection = require('../loaders/mysql')

const SELECT_ALBUMS = "SELECT * FROM album"

router.get('/api/albums', (req, res) => {
    mysqlConnection.query(SELECT_ALBUMS, (err, result) => {
        console.log(result)
        res.send(result)
    })
})

module.exports = router