const express = require('express')

const cors = require('cors')

const expressLoader = ({app}) => {
    app.use(cors());

    app.use(express.json())

    app.use(require('../routes/routes'))

    return app
}

module.exports = expressLoader