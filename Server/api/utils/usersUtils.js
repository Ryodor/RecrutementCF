module.exports.loggedIn = function(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.json({
            response: "",
            error: "Erreur, vous n'êtes pas connecté."
        });
    }
}

module.exports.getUserLanguages = function(userId) {
    return new Promise((resolve, reject) => {
        db.execute('SELECT langId FROM `UsersLangs` WHERE userId = ?', [userId], function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                return resolve(results.map(languages => languages.langId))
            } else {
                reject({
                    response: "",
                    error: "Erreur, aucun langage par rapport a l'utilisateur trouvé."
                })
            }
        })
    })
}

module.exports.getAllCategories = function() {
    return new Promise((resolve, reject) => {
        db.execute('SELECT * FROM `Categories` ', function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                return resolve(results)
            } else {
                reject({
                    response: "",
                    error: "Erreur, aucune categories trouvé."
                })
            }
        })
    })
}

module.exports.insertLangageUsers = function(userId, langIds) {
    if (langIds.length > 0) {
        langIds.forEach(langId => {
            db.execute('INSERT INTO `UsersLangs` (userId,LangId) VALUES (?,?)', [userId, langId], function (error, results, fields) {
                if (error) throw error;
            })
        })
    }
}

module.exports.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

module.exports.validPassword = function(password, passwordHash) {
    return bcrypt.compareSync(password, passwordHash);
}

module.exports.restoreDataQcm = function(object) {
    return new Promise((resolve, reject) => {
        getAllCategories().then(categories => {
            serializeDataQuestion(object).then(allQuestions => {
                if (Array.isArray(allQuestions)) {
                    if (allQuestions.length > 0) {
                        console.log("arrayQuestions : ", allQuestions)
                        let lastCategoryId = categories[categories.length - 1].ID
                        console.log("lastCategoryId ", lastCategoryId)
                        let lastCategoryFind = 0;
                        allQuestions.filter(question => {
                            if (question.categoryId > lastCategoryFind)
                                lastCategoryFind = question.categoryId
                        })
                        for (let i = 1; i <= lastCategoryFind; i++) {
                            let newArrayQuestion = allQuestions.map(element => {
                                if (element.categoryId == i)
                                    return element
                            })
                            object.questions[i] = newArrayQuestion
                        }
                        console.log("=========================== DEBUG =====================")
                        console.log("allQuestions : ", allQuestions)
                        console.log("=======================================================")
                        object.start = true
                        object.navigator.currentCategory = lastCategoryFind
                        object.navigator.currentQuestion = object.questions[object.navigator.currentCategory].length
                        console.log(object.questions[object.navigator.currentCategory][4])
                        if (object.navigator.currentQuestion < 5) {
                            if (object.navigator.currentQuestion < 5) {
                                let retry = 5;
                                do {
                                    if (retry == 0) {
                                        resolve(false);
                                        break;
                                    }
                                    generateQuestionsByCategory(object.navigator.currentCategory, object.languages, object.questions[object.navigator.currentCategory].length - 5)
                                        .then(generateQuestion => {
                                            let newArrayQuestions = object.questions[object.navigator.currentCategory]
                                            generateQuestion.forEach(newQuestion => {
                                                object.questions[object.navigator.currentCategory].forEach(question => {
                                                    if (newQuestion.ID != question.ID) {
                                                        newArrayQuestions.push(newQuestion)
                                                        object.questions[object.navigator.currentCategory] = newArrayQuestions;
                                                    }
                                                })
                                            })
                                        })
                                        .catch(error => {
                                            retry -= 1
                                        })
                                } while (object.questions[object.navigator.currentCategory].length == 5)
                                object.navigator.currentQuestion = object.navigator.currentQuestion + 1
                                object.start = true
                                resolve(true)
                            } else if (lastCategoryId == object.navigator.currentCategory && object.questions[object.navigator.currentCategory][4].answer != undefined) {
                                object.finish = true
                                object.start = true
                                resolve(true)
                            } else if (object.navigator.currentQuestion == 5 && object.navigator.currentCategory < lastCategoryId) {
                                generateQuestionsByCategory(object.navigator.currentCategory + 1, object.languages, 5)
                                    .then(generateQuestion => {
                                        object.navigator.currentQuestion = 0
                                        object.navigator.currentCategory += 1
                                        object.questions[object.navigator.currentCategory] = generateQuestion
                                        object.start = true
                                        resolve(true)
                                    })
                                    .catch(error => {
                                        console.log(error)
                                        reject(error.toString())
                                    })
                            }
                        } else {
                            object.start = false
                            resolve(true)
                        }
                    } else {
                        resolve(false)
                    }
                }else if(allQuestions === undefined){
                    resolve(false)
                }else{
                    reject("Error restore data! ")
                }
            }).catch(error => {
                reject("Error restore data! " + error.toString())
            })
        }).catch(error => {
            reject(error)
        })
    })
}

module.exports.restoreTimestampQcm = function(object){
    //let formatTimeUser = (object.navigator.qcmTimer.split(":")[1])+(object.navigator.qcmTimer.split(":")[2])+("000")
    let formatTimeUser = (parseInt(object.navigator.qcmTimer.split(":")[1]))*(60*1000)
    let newStartTimestamp = Date.now() - object.startTimestamp
    console.log("New timestamp start : ",newStartTimestamp)
    console.log("New time format :",new Date(newStartTimestamp))
    let minutes = Math.abs(new Date(Date.now()).getMinutes() - new Date(newStartTimestamp).getMinutes() - 30)
    let seconds = Math.abs(new Date(Date.now()).getSeconds() - new Date(newStartTimestamp).getSeconds() - 60)
    console.log("Timer cooldown : ",minutes+":"+seconds)
}

async function serializeDataQuestion(object) {
    return new Promise((resolve, reject) => {
        getQuestionsUser(object.id).then(Questions => {
            if (Questions.length > 0){
                let allQuestions = []
                Questions.forEach(question => {
                    let saveQuestion = {
                        ID: question.ID,
                        questionText: question.questionText,
                        categoryId: question.categoryId,
                        langId: question.langId,
                        difficulty: question.difficulty,
                        answer: {
                            ID: question.answerId,
                            choiceIds: question.choiceIds
                        }
                    }
                    allQuestions.push(saveQuestion)
                })
            } else resolve(undefined)
        }).catch(error => {
            reject(error)
        })
    })
}

function getQuestionsUser(userId) {
    return new Promise((resolve, reject) => {
        db.execute('SELECT Question.ID, Question.questionText, Question.categoryId, Question.langId, Question.difficulty, Answers.ID AS answerId, Answers.choiceIds FROM `Question` INNER JOIN `Answers` ON Question.id = Answers.questionId WHERE Answers.userId = ?', [userId], function (error, questions, fields) {
            if (error) reject(error);
            if (questions.length > 0) {
                resolve(questions)
            } else {
                resolve([])
            }
        })
    })
}

function generateQuestionsByCategory(catgeroyId, langIds, nbQuestionGenerate) {
    let queryLangId = "";
    console.log("before db execute")
    setImmediate(() => {
        db.execute('SELECT categoryName FROM `Categories` WHERE ID = ?', [catgeroyId], function (error, results, fields) {
            if (error) throw error;

            if (results.length > 0) {
                console.log("Categorie ", results[0])
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
    console.log("after db execute")
    let executeQuery = ""
    console.log("queryLangId ", queryLangId)
    console.log("queryLangId condition ", queryLangId != "")
    return new Promise((resolve, reject) => {

        if (queryLangId != "") {
            db.execute('SELECT * FROM `Question` WHERE  `categoryId` = ?  AND ' + queryLangId + ' ORDER BY RAND(), langId LIMIT ' + nbQuestionGenerate, [parseInt(catgeroyId)], function (error, results, fields) {
                if (error) throw error;

                if (results.length > 0) {
                    console.log("results ", results)
                    return resolve(results)
                } else
                    return reject({response: "", error: "Aucune question n\'a était trouver."})
            })
        } else {
            db.execute('SELECT * FROM `Question` WHERE  `categoryId` = ? ORDER BY RAND() LIMIT ' + nbQuestionGenerate, [parseInt(catgeroyId)], function (error, results, fields) {
                if (error) throw error;

                if (results.length > 0) {
                    console.log("results ", results)
                    return resolve(results)
                } else
                    return reject({response: "", error: "Aucune question n\'a était trouver."})
            })
        }
    })
}

module.exports.checkObjectUserRegister = function(user) {
    console.log("[@debug] user ", user)
    let check = {
        isValid: false,
        errorValue: []
    }
    if (typeof user == "object") {

        if (Object.keys(user).length == 8) {
            let validKeyName = 0
            let validValue = 0

            for (key in user) {
                if (key == "lastName" || key == "firstName" || key == "email" || key == "birthdate" || key == "languages" || key == "formationName" || key == "formationCity" || key == "formationType") {
                    validKeyName += 1;
                } else
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
            console.log("[DEBUG] validKeyName " + validKeyName);
            console.log("[DEBUG] validValue " + validValue);
            if (validKeyName == 8 && validValue == 4) {
                check.isValid = true;
                return check;
            }
        }
    } else
        check.errorValue.push("(object user)")

    return check;
}

module.exports.checkObjectUserLogin = function checkObjectUserLogin(user) {
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