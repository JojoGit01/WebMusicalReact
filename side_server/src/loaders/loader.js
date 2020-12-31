const expressLoader = require('./express')
const mysqlLoader = require('./mysql')

const loaders = ({expressApp}) => {
    const mysqlConnection = mysqlLoader
    mysqlConnection.connect( (err) => console.log("MySQL connected !"))
    expressLoader({app: expressApp})
}

module.exports = loaders