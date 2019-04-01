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
connectToDatabase().then(db=>{
    console.log("[database] db initalizer.")
    db.sendRequest = function(request,data){
        try {
            return new Promise((resolve, reject) =>{
                if(typeof request != "string"){
                    return reject("la variable requête n'est pas une chaine de caractère")
                }
                if(!Array.isArray(data)){
                    return reject("la variable data n'est pas un tableau")
                }
                db.execute(request,data, function (error, results, fileds) {
                    if(error) return reject(error)
                    else if(results > 0) {
                        console.log(results)
                        return resolve(results)
                    }
                })
            })
        }catch (e) {
            console.log("error :",e)
        }

    }
    global.db = db

})

