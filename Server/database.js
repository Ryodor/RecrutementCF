const database = require('mysql2');
require('dotenv').config()

let db;
if(db == null || db == undefined){
    console.log("[database] database initialisation.")
    db = database.createConnection({
        host     : process.env.DB_HOST,
        user     : process.env.DB_USER,
        password : process.env.DB_PASS,
        database : process.env.DB_NAME,
        debug    : true
    });

/*    db.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            process.exit(1);
            return;
        }

        console.log('connected as id ' + db.threadId);
    });*/
}

module.exports = db;