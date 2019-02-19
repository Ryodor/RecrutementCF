const database = require('mysql2');
require('dotenv').config();

let db;
if(db == null || db == undefined){
    console.log("[database] database initialiser.");
    db = database.createConnection({
        host     : process.env.DB_HOST,
        user     : process.env.DB_USER,
        password : process.env.DB_PASS,
        database : process.env.DB_NAME,
    });
}

module.exports = db;