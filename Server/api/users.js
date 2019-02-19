var express = require('express');
var router = express.Router();
let bcrypt   = require('bcrypt');

/* GET users listing. */
router.get('/', function(req, res, next) {
    db.query('SELECT * FROM Users', function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
});

/* POST users login listing. */
router.post('/login', function(req, res, next) {
    user = JSON.parse(req.query.user);
    console.log("[DEBUG-USER] ",user);

    db.execute('SELECT lastName, firstName, userId, userPassword FROM `Users` WHERE `email`= ? ', [user.email], function (error, results, fields) {
        if (error) throw error;
        console.log("-----------------");
        console.log(req.cookies);
        console.log(req.session);
        console.log(req.sessionID);
        console.log("-----------------");

        if(results.length > 0){
            if(validPassword(user.password,results[0].userPassword))
                return res.send({response:{userId:results[0].userId,lastName:results[0].lastName,firstName:results[0].firstName,sessionID:req.sessionID,email:results[0].email},error:""});
            else
                return res.send({response:"",error:"Password invalide"})
        }
        else
            return res.send({response:"",error:"Login invalide"})
    });
    //res.send('ok');
});

function generateHash(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

function validPassword(password, passwordHash){
    return bcrypt.compareSync(password, passwordHash);
}

module.exports = router;
