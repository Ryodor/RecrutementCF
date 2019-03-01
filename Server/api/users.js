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
    if (!req.user) {
        console.log(req.body)
        let user = req.body.user

        if (typeof req.body != 'object')
            user = JSON.parse(req.body.user)

        let checkLogin = checkObjectUserLogin(user)
        console.log(checkLogin.errorValue)
        if (checkLogin.isValid) {
            db.execute('SELECT lastName, firstName, ID, userPassword FROM `Users` WHERE `email`= ? ', [user.email], function (error, results, fields) {
                if (error) throw error;

                if (results.length > 0) {
                    if (validPassword(user.password, results[0].userPassword)) {
                        req.sessions.user = {
                            id: results[0].ID,
                            firstName: results[0].firstName,
                            lastName: results[0].lastName,
                            sessionID: req.sessionID,
                            checkHash: bcrypt.hashSync(this.id.toString() + this.firstName + this.lastName + this.sessionID.toString(), bcrypt.genSaltSync(1), null)
                        }
                        req.user.questions = []
                        req.user.questions.navigator = {
                            currentCategory: 0,
                            currentQuestion: 0,
                            qcmTimer:"00:30:00",
                            allCategoriesExists: Categories,
                            isVaildCategory: function(checkValue){
                                if(/^[0-9]+^$/.test(catgeory)){
                                    this.allCategoriesExists.forEach(category=>{
                                        if(category.id == checkValue)
                                            return true
                                        else
                                            return false
                                    })
                                }else if(/^[a-zA-Z]+^$/.test(catgeory)){
                                    this.allCategoriesExists.forEach(category=>{
                                        if(category.categoryName == checkValue)
                                            return true
                                        else
                                            return false
                                    })
                                }
                                return false
                            },
                            isVaildQuestionId: function(questionId, categoryId){
                                if(req.user.questions[categoryId][questionId] != undefined){
                                    return true
                                }
                                return false
                            },
                            changeCategory: function (categoryId) {
                                if(this.isVaildCategory){
                                    let iterator = req.user.questions.keys;
                                    let findKey = false;
                                    for(key of iterator){
                                        if(key == categoryId){
                                            findKey = true;
                                            break;
                                        }
                                    }
                                    if(!findKey){
                                        //return new Promise((resolve, reject) => {
                                        generateQuestionsByCategory(categoryId, user.langages)
                                            .then(result=>{
                                                req.user.questions[categoryId] = result
                                                return true;
                                            })
                                            .catch(error=>{
                                                console.error(error)
                                                return false;
                                            })
                                        //})
                                    }
                                    this.currentCategory = categoryId;
                                }else{
                                    return false;
                                }
                            },
                            changeQuestion: function (questionId, catgeoryId) {
                                if(req.user.questions[catgeoryId] == undefined){
                                    if(this.changeCategory(catgeoryId)){
                                        this.currentCategory = catgeoryId
                                        this.currentQuestion = 0
                                        return req.user.questions[catgeoryId][0]
                                    }
                                    return "Catégorie invalide"
                                }else{
                                    if(this.isVaildCategory(catgeoryId) && this.isVaildQuestionId(questionId,catgeoryId)){
                                        this.currentCategory = catgeoryId
                                        this.currentQuestion = questionId
                                        return req.user.questions[catgeoryId][questionId]
                                    }
                                    return "categoryId ou questionId Invalide"
                                }
                            }
                        }

                        return res.json({response: req.user, error: ""})
                    } else
                        return res.json({response: "", error: "Invalid Password"})
                } else
                    return res.json({response: "", error: "Invalid Login"})
            });
        } else
            return res.json({
                response: "",
                error: "Valeur ou/et syntax, envoyer sont invalide  " + checkLogin.errorValue.toString()
            })
    } else
        res.redirect("/profile")
});

/* POST users register listing. */
router.post('/register', function (req, res, next) {
    if (!req.user) {
        let user = req.body.user

        if (typeof req.body != 'object')
            user = JSON.parse(req.body.user)

        let checkRegister = checkObjectUserRegister(user);
        console.log("[DEBUG] checkObjectUserRegister ",checkRegister);
        if (checkRegister.isValid) {
            db.execute('SELECT ID FROM `Users` WHERE `email`= ? ', [user.email], function (error, results, fields) {
                if (error) throw error;

                if (results.length == 0) {

                    //let password = generatePassword(6, false)
                    let password = "";
                    for (let i = 0; i < 6; i++) {
                        password += Math.floor((Math.random() * 10));
                    }
                    const passwordHash = generateHash(password)

                    let date = new Date()
                    let testDate = date.getFullYear() + "-" + date.getMonth() + "-" + date.getHours() + " " + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds()

                    /* envoie du mail de confirmation avec le mot de passe */
                    // TODO : Envoie de mail de verification.

                    /* Enregisterment du compte dans la base de donnée */
                    db.execute('INSERT INTO Users (lastName, firstName, email, userPassword, lawLevel, birthdate, testDate, activatedAccount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [user.lastName, user.firstName, user.email, passwordHash, 0, user.birthdate, testDate, 1],
                        function (error, results, fields) {
                            console.log("[DEBUG] ", results)
                            if (error) throw error;
                            else {
                                db.execute('INSERT INTO `FormationWishes` (userId, formationId, cityId, typeId) VALUES (?,?,?,?)', [results.insertId, user.formationName, user.formationCity, user.formationType])
                                insertLangageUsers(results.insertId, user.languages)
                                req.user = {
                                    id: results.insertId,
                                    firstName: user.firstName,
                                    lastName: user.lastName,
                                    sessionID: req.sessionID,
                                    languages: user.languages
                                }
                                req.user.checkHash = bcrypt.hashSync(req.user.id.toString() + req.user.firstName + req.user.lastName + req.user.sessionID.toString, bcrypt.genSaltSync(1), null)

                                req.user.questions = []
                                req.user.questions.navigator = {
                                    currentCategory: 0,
                                    currentQuestion: 0,
                                    qcmTimer:"00:30:00",
                                    allCategoriesExists: Categories,
                                    isVaildCategory: function(checkValue){
                                        if(/^[0-9]+^$/.test(catgeory)){
                                            this.allCategoriesExists.forEach(category=>{
                                                if(category.id == checkValue)
                                                    return true
                                                else
                                                    return false
                                            })
                                        }else if(/^[a-zA-Z]+^$/.test(catgeory)){
                                            this.allCategoriesExists.forEach(category=>{
                                                if(category.categoryName == checkValue)
                                                    return true
                                                else
                                                    return false
                                            })
                                        }
                                        return false
                                    },
                                    isVaildQuestionId: function(questionId, categoryId){
                                        if(req.user.questions[categoryId][questionId] != undefined){
                                            return true
                                        }
                                        return false
                                    },
                                    changeCategory: function (categoryId) {
                                        if(this.isVaildCategory){
                                            let iterator = req.user.questions.keys;
                                            let findKey = false;
                                            for(key of iterator){
                                                if(key == categoryId){
                                                    findKey = true;
                                                    break;
                                                }
                                            }
                                            if(!findKey){
                                                //return new Promise((resolve, reject) => {
                                                generateQuestionsByCategory(categoryId, user.langages)
                                                    .then(result=>{
                                                        req.user.questions[categoryId] = result
                                                        return true;
                                                    })
                                                    .catch(error=>{
                                                        console.error(error)
                                                        return false;
                                                    })
                                                //})
                                            }
                                            this.currentCategory = categoryId;
                                        }else{
                                            return false;
                                        }
                                    },
                                    changeQuestion: function (questionId, catgeoryId) {
                                        if(req.user.questions[catgeoryId] == undefined){
                                            if(this.changeCategory(catgeoryId)){
                                                this.currentCategory = catgeoryId
                                                this.currentQuestion = 0
                                                return req.user.questions[catgeoryId][0]
                                            }
                                            return "Catégorie invalide"
                                        }else{
                                            if(this.isVaildCategory(catgeoryId) && this.isVaildQuestionId(questionId,catgeoryId)){
                                                this.currentCategory = catgeoryId
                                                this.currentQuestion = questionId
                                                return req.user.questions[catgeoryId][questionId]
                                            }
                                            return "categoryId ou questionId Invalide"
                                        }
                                    }
                                }

                                console.log(req.user)
                                return res.json({
                                    response: {
                                        id: results.insertId,
                                        firstName: user.firstName,
                                        lastName: user.lastName,
                                        login: user.email,
                                        sessionID: req.sessionId,
                                        checkHash: user.checkHash,
                                        password: password
                                    }, error: ""
                                })
                            }

                        })
                } else
                    return res.json({response: "", error: "L'email a déjà était enregistré."})
            });
        } else
            return res.json({
                response: "",
                error: "Valeur ou/et syntax sont invalide " + checkRegister.errorValue.toString()
            })
    }
});

router.get('/lang', function (req, res, next) {
    console.log("[DEBUG] test");
    db.execute('SELECT * FROM `ProgLanguage`', function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            return res.json({
                response: {
                    languages: results
                },
                error: ""
            });
        } else
            return res.json({
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
        if (results.length > 0) {
            formations = results;
            console.log(results)
            console.log("[DEBUG] 1", formations);

        } else
            return res.json({
                response: "",
                error: "Erreur, aucune formation trouvee"
            })
    })

    db.execute('SELECT * FROM `City`', function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            cities = results;
            console.log(results)
            console.log("[DEBUG] 1", cities);

        } else
            return res.json({
                response: "Erreur, aucun lieu de formation trouve"
            })
    })

    db.execute('SELECT * FROM `FormationTypes`', function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            return res.json({
                response: {
                    formations: formations,
                    cities: cities,
                    types: results
                },
                error: ""
            })
        } else
            return res.json({
                response: "",
                error: "Erreur, aucun type de formation trouve"
            })
    })


})

// ========================================================

function loggedIn(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.json({
            response: "",
            error: "Erreur, vous n'êtes pas connecté."
        });
    }
}

function insertLangageUsers(userId, langIds) {
    if (langIds.length > 0) {
        langIds.forEach(langId => {
            db.execute('INSERT INTO `UsersLangs` (userId,LangId) VALUES (?,?)', [userId, langId], function (error, results, fields) {
                if (error) throw error;
            })
        })
    }
}

function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

function validPassword(password, passwordHash) {
    return bcrypt.compareSync(password, passwordHash);
}

function checkObjectUserRegister(user) {
    console.log("[@debug] user ",user)
    let check = {
        isValid: false,
        errorValue: []
    }
    if (typeof user == "object") {

        if (Object.keys(user).length == 8) {
            let validKeyName = 0
            let validValue = 0

            for (key in user) {
                if(key == "lastName" || key == "firstName" || key == "email" || key == "birthdate" || key == "langages" || key == "formationName" || key == "formationCity" || key == "formationType"){
                    validKeyName += 1;
                }else
                    check.errorValue.push(key)
            }

            for (key in user) {
                if (key == "lastName" || key == "firstName") {
                    if (/^[a-zA-Z]+$/.test(user[key]))
                        validValue += 1
                    else
                        check.errorValue.push(user[key])
                }
                if (key == "email") {
                    if (/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(user[key]))
                        validValue += 1;
                    else
                        check.errorValue.push(user[key])
                }
                if (key == "birthdate") {
                    let regexDate = new RegExp(/^(19[0-9]{2}|20[0-1][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/)
                    if (regexDate.test(user[key]))
                        validValue += 1
                    else
                        check.errorValue.push(user[key])
                }
/*                if (key == "formationName") {
                    db.execute('SELECT * FROM `Formations`', function (error, results, fields) {
                        if (error) throw error;
                        if (results.length > 0) {
                            let checkElementValue = validValue;
                            results.forEach(formationName => {
                                if (user[key] == formationName) {
                                    validValue += 1
                                }
                            })
                            if (checkElementValue+1 == validValue) {

                            } else
                                check.errorValue.push(user[key])
                        }
                    })
                }
                if (key == "formationCity") {
                    db.execute('SELECT * FROM `City`', function (error, results, fields) {
                        if (error) throw error;
                        if (results.length > 0) {
                            let checkElementValue = validValue;
                            results.forEach(formationName => {
                                if (user[key] == formationName) {
                                    validValue += 1
                                }
                            })
                            if (checkElementValue+1 == validValue) {

                            } else
                                check.errorValue.push(user[key])
                        }
                    })
                }
                if (key == "formationType") {
                    db.execute('SELECT * FROM `FormationTypes`', function (error, results, fields) {
                        if (error) throw error;
                        if (results.length > 0) {
                            let checkElementValue = validValue;
                            results.forEach(formationName => {
                                if (user[key] == formationName) {
                                    validValue += 1
                                }
                            })
                            if (checkElementValue+1 == validValue) {

                            } else
                                check.errorValue.push(user[key])
                        }
                    })
                }*/
            }
            console.log("[DEBUG] validKeyName "+validKeyName);
            console.log("[DEBUG] validValue "+validValue);
            if (validKeyName == 8 && validValue == 4) {
                check.isValid = true;
                return check;
            }
        }
    }else
        check.errorValue.push("(object user)")

    return check;
}

function checkObjectUserLogin(user) {
    if (typeof user == "object") {
        if (Object.keys(user).length == 2) {
            let validKeyName = 0
            let validValue = 0
            check = {
                isValid: false,
                errorValue: []
            }

            for (key in user) {
                if (key == "email" || key == "password")
                    validKeyName += 1;
            }

            for (key in user) {
                if (key == "email") {
                    if (/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(user[key]))
                        validValue += 1;
                    else
                        check.errorValue.push(key)
                }
            }

            if (validKeyName == 2 && validValue == 1) {
                check.isValid = true;
                return check;
            }
        }
    }
    return check;
}

module.exports = router;