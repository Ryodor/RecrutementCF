let express = require('express');
let router = express.Router();
let bcrypt = require('bcrypt');
let generatePassword = require('password-generator');

/* GET users listing. */
router.get('/', function (req, res, next) {
    db.query('SELECT * FROM Users', function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
});

/* POST users login listing. */
router.post('/login', function (req, res, next) {
    console.log(req.body)
    let user = req.body.user

    if(typeof req.body != 'object')
        user = JSON.parse(req.body.user)

    let checkLogin = checkObjectUserLogin(user)
    console.log(checkLogin.errorValue)
    if(checkLogin.isValid){
        db.execute('SELECT lastName, firstName, ID, userPassword FROM `Users` WHERE `email`= ? ', [user.email], function (error, results, fields) {
            if (error) throw error;

            if (results.length > 0) {
                if (validPassword(user.password, results[0].userPassword))
                    return res.send({
                        response: {
                            userId: results[0].userId,
                            lastName: results[0].lastName,
                            firstName: results[0].firstName,
                            sessionID: req.sessionID
                        }, error: ""
                    });
                else
                    return res.send({response: "", error: "Invalid Password"})
            } else
                return res.send({response: "", error: "Invalid Login"})
        });
    }else
        return res.send({response: "", error: "Valeur ou/et syntax, envoyer sont invalide  "+checkLogin.errorValue.toString()})
});

/* POST users register listing. */
router.post('/register', function (req, res, next) {
    console.log("[DEBUG-REGISTER-BODY]" ,req.body)
    let user = req.body.user

    if(typeof req.body != 'object')
        user = JSON.parse(req.body.user)

    let checkRegister = checkObjectUserRegister(user);
    if(checkRegister.isValid){
        db.execute('SELECT ID FROM `Users` WHERE `email`= ? ', [user.email], function (error, results, fields) {
            if (error) throw error;

            if (results.length == 0) {

                //let password = generatePassword(6, false)
                let password = "";
                for(let i = 0;i<6;i++){
                    password+= Math.floor((Math.random() * 10));
                }
                const passwordHash = generateHash(password)

                let date = new Date()
                let testDate = date.getFullYear()+"-"+date.getMonth()+"-"+date.getHours()+" "+date.getHours()+"-"+date.getMinutes()+"-"+date.getSeconds()

                /* envoie du mail de confirmation avec le mot de passe */
                // TODO : Envoie de mail de verification.

                /* Enregisterment du compte dans la base de donnée */
                db.execute('INSERT INTO Users (lastName, firstName, email, userPassword, lawLevel, birthdate, testDate, activatedAccount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [user.lastName, user.firstName, user.email, passwordHash, 0, user.birthdate, testDate,  1],
                    function (error, results, fields) {
                        console.log("[DEBUG] ",results)
                        if (error) throw error;
                        else
                            return res.send({
                                response: {
                                    id: results.insertId,
                                    lastName: user.lastName,
                                    firstName: user.firstName,
                                    password: password,
                                    sessionID: req.sessionID
                                }, error: ""
                            });
                    })
            } else
                return res.send({response: "", error: "L'email a déjà était enregistré."})
        });
    }else
        return res.send({response: "", error: "Valeur ou/et syntax, envoyer sont invalide "+checkRegister.errorValue.toString()})
});

router.get('/lang', function (req, res, next) {
    console.log("[DEBUG] test");
    db.execute('SELECT * FROM `ProgLanguage`', function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            return res.send({
               response:{
                   languages: results
               },
                error: ""
            });
        } else
            return res.send({
                response: "",
                error: "Erreur, aucun langage trouver"
            })
    })
})

router.get('/formations', function (req, res, next) {
    console.log("[DEBUG] test");
    let formations;
    let cities;
    console.log()
    db.execute('SELECT * FROM `Formations`', function (error, results, fields) {
        if (error) throw error;
        if(results.length > 0){
            formations = results;
            console.log(results)
            console.log("[DEBUG] 1",formations);

        }else
            return res.send({
                response: "",
                error:"Erreur, aucune formation trouvee"
            })
    })

    db.execute('SELECT * FROM `City`', function (error, results, fields) {
        if (error) throw error;
        if(results.length > 0){
            cities = results;
            console.log(results)
            console.log("[DEBUG] 1",cities);

        }else
            return res.send({
                response:"Erreur, aucun lieu de formation trouve"
            })
    })

    db.execute('SELECT * FROM `FormationTypes`', function (error, results, fields) {
        if (error) throw error;
        if(results.length > 0){
            return res.send({
                response: {
                    formations: formations,
                    cities: cities,
                    types: results
                },
                error: ""
            })
        }else
            return res.send({
                response: "",
                error:"Erreur, aucun type de formation trouve"
            })
    })


})

// ========================================================

function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

function validPassword(password, passwordHash) {
    return bcrypt.compareSync(password, passwordHash);
}

function checkObjectUserRegister(user){
    if(typeof user == "object"){

        if(Object.keys(user).length == 4){
            let validKeyName = 0
            let validValue = 0

            check = {
                isValid: false,
                errorValue:[]
            }

            for(key in user){
                if(key == "lastName" || key == "firstName" ||  key == "email" ||  key == "birthdate")
                    validKeyName += 1;
            }

            for(key in user){
                if(key == "lastName" || key == "firstName"){
                    if(/^[a-zA-Z]+$/.test(user[key]))
                        validValue += 1
                    else
                        check.errorValue.push(key)
                }
                if(key == "email"){
                    if(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(user[key]))
                        validValue += 1;
                    else
                        check.errorValue.push(key)
                }
                if(key == "birthdate"){
                    let regexDate = new RegExp(/^(19[0-9]{2}|20[0-1][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/)
                    if(regexDate.test(user[key]))
                        validValue += 1
                    else
                        check.errorValue.push(key)
                }
            }

            if(validKeyName == 4 && validValue == 4){
                check.isValid = true;
                return check;
            }
        }
    }
    return check;
}

function checkObjectUserLogin(user){
    if(typeof user == "object"){
        if(Object.keys(user).length == 2){
            let validKeyName = 0
            let validValue = 0
            check = {
                isValid: false,
                errorValue:[]
            }

            for(key in user){
                if(key == "email" ||  key == "password")
                    validKeyName += 1;
            }

            for(key in user){
                if(key == "email"){
                    if(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(user[key]))
                        validValue += 1;
                    else
                        check.errorValue.push(key)
                }
            }

            if(validKeyName == 2 && validValue == 1){
                check.isValid = true;
                return check;
            }
        }
    }
    return check;
}

module.exports = router;