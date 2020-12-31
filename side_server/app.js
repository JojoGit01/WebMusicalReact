const loaders = require('./src/loaders/loader')
const express = require('express')
const config = require('./src/config/config')

const StartServer = () => {
    const app = express()

    loaders({expressApp: app})
    
    app.listen(config.port, () => console.log("Listen http://localhost:4000"))

}

StartServer()

