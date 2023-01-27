const pg = require('pg')


const client = new pg.Pool({
    host:"localhost",
    user:"postgres",
    port:5432,
    password:"toor",
    database:"gecko"
})

module.exports={client:client}