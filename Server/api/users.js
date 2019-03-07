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


router.get('/guard', function (req, res, next) {
    console.log("req.session ",req.sessionID)
    console.log("req.session ",req.session)
    console.log("req.session.user ",req.session.user)
    console.log("req.user ",req.user)
    if(req.user || req.session.user)
        return res.json({response: req.session.user, error: ""})
    else
        return res.json({response: "", error: "Vous n'êtes pas connecter"})
});

/* POST users login listing. */
router.post('/login', function (req, res, next) {
    if (!req.session.user) {
        console.log(req.body)
        let user = req.body.user

        if (typeof req.body != 'object')
            user = JSON.parse(req.body.user)

        let checkLogin = checkObjectUserLogin(user)
        console.log(checkLogin.errorValue)
        if (checkLogin.isValid) {
            db.execute('SELECT * FROM `Users` WHERE `email`= ? ', [user.email], function (error, results, fields) {
                if (error) throw error;

                if (results.length > 0) {

                    if (validPassword(user.password, results[0].userPassword)) {
                        getUserLanguages(results[0].ID)
                            .then(languages=>{
                                console.log("languages ",languages)
                                req.user = {
                                    id: results[0].ID,
                                    firstName: results[0].firstName,
                                    lastName: results[0].lastName,
                                    sessionID: req.sessionID,
                                    languages: languages,
                                    finish: results[0].finish == 0 ? false : true,
                                    checkHash: bcrypt.hashSync(results[0].ID + results[0].firstName + results[0].lastName + req.sessionID, bcrypt.genSaltSync(1), null)
                                }

                                req.user.login = results[0].email
                                req.session.user = req.user
                                req.session.user.questions = []
                                req.session.user.navigator = {
                                    currentCategory: 1,
                                    currentQuestion: 0,
                                    qcmTimer:results[0].time,
                                }
                               /* restoreDataQcm(req.session.user, req.session.user.id)
                                    .then()
                                    .catch()*/
                                console.log("req.session ",req.session)
                                console.log("req.sessionId ",req.sessionID)
                                //res.set('Set-Cookie', req.session.cookie);
                                //res.cookie(req.session.cookie)
                                res.json({response: req.user, error: ""})
                            })
                            .catch()
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
        res.json({
            response: "",
            error: "Vous êtes déjà connecter"
        })
    console.log("req.sessionId ",req.sessionID)
    console.log("session cookie",req.session.cookie)
    console.log("req.session.user", req.session.user)
    console.log("req.user", req.user)
});

/* POST users register listing. */
router.post('/register', function (req, res, next) {
    if (!req.session.user) {
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
                                    languages: user.languages,
                                    finish: false,
                                    questions: [],
                                    navigator : {
                                        currentCategory: 1,
                                        currentQuestion: 0,
                                        qcmTimer:"00:30:00"
                                    }
                                }
                                req.user.checkHash = bcrypt.hashSync(req.user.id + req.user.firstName + req.user.lastName + req.user.sessionID, bcrypt.genSaltSync(1), null)

                                req.session.user = req.user;
                                console.log(req.session.user)
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
    }else
        res.json({
            response: "",
            error: "Vous êtes déjà connecter"
        })
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

function getUserLanguages (userId){
    return new Promise((resolve, reject) => {
        db.execute('SELECT langId FROM `UsersLangs` WHERE userId = ?', [userId], function (error, results, fields) {
            if (error) throw error;
            if(results.length > 0){
                return resolve(results.map(languages=> languages.langId))
            }else{
                reject({
                    response: "",
                    error: "Erreur, aucun langage par rapport a l'utilisateur trouvé."
                })
            }
        })
    })
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

function restoreDataQcm(object, userId){
    return new Promise((resolve, reject) => {
        db.execute('SELECT * FROM `Answers` WHERE userId = ?', [userId], function (error, answers, fields) {
            if (error) throw error;
            if (answers.length > 0) {
                answers.forEach(answer=>{
                    db.execute('SELECT * FROM `Question` WHERE ID = ?', [answer.questionId], function (error, questions, fields) {
                        if (error) throw error;
                        if (questions.length > 0) {
                            questions.forEach(question=>{
                                if(answers.questionId == questions.ID){
                                    questions.answer =  answer
                                    object.questions[questions.categoryId].push(question)
                                }
                            })
                        }
                    })
                })
                object.start = true
                object.navigator.currentCategory = object.questions.length
                object.navigator.currentQuestion = object.question[object.navigator.currentCategory][object.question[object.navigator.currentCategory].length]
                if(object.navigator.currentQuestion < 5){
                    let retry = 5;
                    do{
                        if(retry == 0){
                            break;
                        }
                        generateQuestionsByCategory(object.navigator.currentCategory, object.languages, object.questions[object.navigator.currentCategory].length-5)
                            .then(generateQuestion=>{
                                generateQuestion.forEach(newQuestion=>{
                                    object.questions[object.navigator.currentCategory].forEach(question=>{
                                        if(newQuestion.ID != question.ID){
                                            object.questions[object.navigator.currentCategory].push(newQuestion)
                                        }
                                    })
                                })
                            })
                            .catch(error=>{
                                retry -= 1
                            })
                    }while(object.questions[object.navigator.currentCategory].length == 5)
                    object.navigator.currentQuestion = object.navigator.currentQuestion+1
                    resolve(true)
                }else if(object.navigator.currentQuestion == 5 && object.navigator.currentCategory == 6){
                    object.finish = true
                    return resolve(true)
                }
            }else{
                return resolve(false)
            }
        })
    })
}

function generateQuestionsByCategory(catgeroyId, langIds, nbQuestionGenerate) {
    let queryLangId = "";
    setImmediate(()=>{
        db.execute('SELECT categoryName FROM `Categories` WHERE ID = ?', [catgeroyId], function (error, results, fields) {
            if (error) throw error;

            if (results.length > 0) {
                console.log("Categorie ",results[0])
                if (results[0].categoryName == "Syntaxe" || results[0].categoryName == "Algo") {
                    if (langIds.length > 1) {
                        queryLangId += "("
                        langIds.forEach((lang, index) => {
                            if (index == langIds.length - 1)
                                queryLangId += "langId = " + lang
                            else
                                queryLangId += "langId = " + lang + " OR "
                        })
                        queryLangId += ")"
                    } else
                        queryLangId = langIds[0]
                }
            }
        })
    })
    let executeQuery = ""
    console.log("queryLangId ",queryLangId)
    console.log("queryLangId condition ", queryLangId != "")
    return new Promise((resolve, reject) => {

        if(queryLangId != ""){
            db.execute('SELECT * FROM `Question` WHERE  `categoryId` = ?  AND ' + queryLangId + ' ORDER BY RAND(), langId LIMIT '+nbQuestionGenerate,[parseInt(catgeroyId)], function (error, results, fields) {
                if (error)throw error;

                if (results.length > 0) {
                    console.log("results ", results)
                    return resolve(results)
                } else
                    return reject({response: "", error: "Aucune question n\'a était trouver."})
            })
        } else{
            db.execute('SELECT * FROM `Question` WHERE  `categoryId` = ? ORDER BY RAND() LIMIT '+nbQuestionGenerate,[parseInt(catgeroyId)], function (error, results, fields) {
                if (error)throw error;

                if (results.length > 0) {
                    console.log("results ", results)
                    return resolve(results)
                } else
                    return reject({response: "", error: "Aucune question n\'a était trouver."})
            })
        }
    })
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
                if(key == "lastName" || key == "firstName" || key == "email" || key == "birthdate" || key == "languages" || key == "formationName" || key == "formationCity" || key == "formationType"){
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
                // TODO : dans le futur pourra verifier si les valeur sont bonne

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