const database = require('mysql2');
require('dotenv').config();

async function connectToDatabase(){
    console.log("[database] initialize db.")
    return await database.createConnection({
        host     : process.env.DB_HOST,
        user     : process.env.DB_USER,
        password : process.env.DB_PASS,
        database : process.env.DB_NAME,
    })
}

module.exports = connectToDatabase()