let express = require('express');
let router = express.Router();

router.get('/', function (req, res, next) {
    res.send("Sa semble fonctionner")
    console.log(req.session.user)
    res.send(req.session.user)
})

router.get('/start', function (req, res, next) {
    console.log("test")
    if (req.session.user) {
        /* Creation  d'un template de QCM est l'envoie en json */

        let Categories;
        let Langages;

        db.execute('SELECT langId FROM `UsersLangs` WHERE userId = ?', [req.session.user.id], function (error, results, fields) {
            if (error) throw error;
            else if (results.length > 0) {
                languagesUsers = results;
            }
        })
        db.execute('SELECT * FROM `Categories` ', function (error, results, fields) {
            if (error) throw error;
            else if (results.length > 0) {
                Categories = results;
            }
        })

        db.execute('SELECT * FROM `ProgLanguage` ', function (error, results, fields) {
            if (error) throw error;
            else if (results.length > 0) {
                Langages = results;
            }
        })
        if(!req.session.user.finish){

            if (!req.session.user.start) {
                console.log("if not start")
                db.execute('SELECT langId FROM `UsersLangs` WHERE userId = ?', [req.session.user.id], function (error, languagesUsers, fields) {
                    if (error) throw error;
                    else if (languagesUsers.length > 0) {
                        console.log(languagesUsers)
                        console.log("user ",req.session.user)
                        generateQuestionsByCategory(req.session.user.navigator.currentCategory, languagesUsers.map(element => element.langId))
                            .then(question => {
                                console.log("[DEBUG] question1 ", question)
                                req.session.user.start = true
                                req.session.user.navigator.currentCategory = 1
                                req.session.user.navigator.currentQuestion = 0
                                req.session.user.questions[1] = question
                                req.session.user.startTimestamp = Date.now()
                                db.execute('UPDATE `Users` SET `timestampStart` = ?',[req.session.user.startTimestamp],function(err,results,fields){
                                    if(err) throw err
                                })
                                req.session.user.currentTimestamp = Date.now()
                                //req.session.user.navigator.qcmTimer = "00:30:00"
                                req.session.user.navigator.allCategoriesExists = Categories

                                setImmediate(() => {
                                    db.execute('SELECT * FROM `Choice` WHERE `questionId` = ?', [question[0].ID], function (error, results, fields) {
                                        if (error) throw error;

                                        if (results.length > 0) {
                                            let timer = req.session.user.navigator.qcmTimer.split(":")
                                            console.log("timer ",timer)
                                            results.forEach(element=>{
                                                delete element.rightAnswer
                                            })
                                            return res.send({
                                                response: {
                                                    sessionID: req.sessionID,
                                                    categories: Categories,
                                                    langages: Langages,
                                                    question: question[0],
                                                    questionId: 0,
                                                    choice: results,
                                                    tiemstamp: req.session.user.currentTimestamp,
                                                    timer:{
                                                        minutes: timer[1],
                                                        seconds: timer[2]
                                                    }
                                                }, error: ""
                                            });
                                        } else
                                            return res.json({response: "", error: "Aucune choix n\'a était trouver."})
                                    })
                                })
                            })
                            .catch(error => {
                                throw error
                                return res.json({response: "", error: "Aucune question n\'a était trouver 3. "+error})
                            })
                    } else {
                        return res.json({
                            response: "", error: "Une erreur et survenue a la récupération des lang du candidat"
                        });
                    }
                })
            } else {
                console.log("if start")
                let question = req.session.user.questions[req.session.user.navigator.currentCategory][req.session.user.navigator.currentQuestion]
                console.log(question)
                db.execute('SELECT * FROM `Choice` WHERE `questionId` = ?', [question.ID], function (error, results, fields) {
                    if (error) throw error;

                    if (results.length > 0) {
                        req.session.user.currentTimestamp = Date.now()
                        saveTimerUser(req.session.user)
                        let timer = req.session.user.navigator.qcmTimer.split(":")
                        console.log("timer :",timer)
                        return res.json({
                            response: {
                                sessionID: req.sessionID,
                                categories: Categories,
                                langages: Langages,
                                question: question,
                                questionId: req.session.user.navigator.currentQuestion,
                                choice: results,
                                tiemstamp: req.session.user.currentTimestamp,
                                timer: {
                                    minutes: timer[1],
                                    seconds: timer[2]
                                }
                            }, error: ""
                        });
                    } else {
                        return res.json({
                            response: "",
                            error: "Error pas de question trouver dans la session user"
                        })
                    }
                })
            }
        }else{
            let text = ""
            req.session.user.navigator.qcmTimer == 0? text = "Temps ecouler , le test et finis." : text = "Bravo, vous avez fini le test en répondent a toutes les questions .";
            return res.json({
                response: {sessionId: req.sessionID,finish : true},
                error: ""
            })
        }
    } else
        return res.send({response: "", error: "Vous n'êtes pas connecter a un compte."})

})

router.post('/finish', function (req, res, next) {
    if (req.session.user) {
        if(!req.session.user.finish && req.session.user.start){
            console.log("time : ",req.body)
            if( req.body.timer.minute == 0 &&  req.body.timer.second == 0){
                req.session.user.finish == true
                db.execute('UPDATE `Users` SET `finish` = ?, `time` = ? WHERE ID = ?' ,[1, "00:00:00",req.session.user.id], function (error, results, fields) {
                    if (error) throw error;
                    else
                        console.log("in update")
                })
                let text = ""
                req.session.user.navigator.qcmTimer == 0? text = "Temps ecouler , le test et finis." : text = "Bravo, vous avez fini le test en répondent a toutes les questions .";
                return res.json({
                    response: {
                        sessionID: req.sessionID,
                        finish: true,
                    }, error: ""
                })
            }else if((req.body.timer.minute > 0 && req.body.timer.second > 0) || (req.body.timer.minute == 0 && req.body.timer.second > 0) || (req.body.timer.minute > 0 && req.body.timer.second == 0)){
                return res.json({
                    response: "", error: "Vous n'avez pas fini le test ou le temps n'ets pas encore écouler."
                })
            }else{
                let checkQuestion = req.body.response.question;
                let lastQuestionId = session.user.question[req.session.user.navigator.currentCategory].length
                if(checkQuestion.categoryId == req.session.user.navigator.currentCategory && req.session.user.question[req.session.user.navigator.currentCategory][lastQuestionId] == req.session.user.navigator.currentQuestion){
                    req.session.user.finish == true
                    req.session.user.currentTimestamp = Date.now()
                    saveTimerUser(req.session.user)
                    db.execute('UPDATE `Users` SET `finish` = ? WHERE ID = ?' ,[req.session.user.finish,req.session.user.id], function (error, results, fields) {
                        if (error) throw error;
                        else
                            console.log("in update")
                    })
                    let text = ""
                    req.session.user.navigator.qcmTimer == 0? text = "Temps ecouler , le test et finis." : text = "Bravo, vous avez fini le test en répondent a toutes les questions.";
                    return res.redirect("/finish")
                    /*return res.json({
                        response: {
                            sessionID: req.sessionID,
                            finish: true,
                            finishText: text
                        }, error: ""
                    })*/
                }
            }
        }else if(req.session.user.finish){
            return res.redirect("/finish")
           /* return res.json({
                response: "", error: "Vous avez déjà fini le test."
            })*/
        }else{
            return res.json({
                response: "", error: "vous n'avez pas encore commencer le test."
            })
        }
    }else{
        return res.json({
            response: "", error: "Vous n'êtes pas connecter"
        })
    }
})

router.post('/question', function (req, res, next) {
    if (req.session.user) {
        if(req.session.user.start == true && req.session.user.finish ==false){
            let response = req.body.response;
            let nextQuestion = req.body.nextQuestion;
            if (typeof response != "object")
                response = JSON.parse(response);

            let validResponse = checkValidResponse(response);
            if (validResponse.isValid) {
                console.log("================= DEBUG Response question ======================")
                console.log(req.body)
                //  Verifier que les choiceIds corésponde avec les réponse possible de la question (utilise rune fonction)
                let question = req.session.user.questions[req.session.user.navigator.currentCategory][req.session.user.navigator.currentQuestion]
                isValidChoiceForTheQuestion(response.choiceIds, question.ID)
                    .then(dataValidChoice => {
                        let dateSaveAnswers = new Date()
                        let dateFormat = dateSaveAnswers.getFullYear()+"-"+dateSaveAnswers.getMonth()+'-'+dateSaveAnswers.getDay()+" "+dateSaveAnswers.getHours()+":"+dateSaveAnswers.getMinutes()+":"+dateSaveAnswers.getSeconds()
                        db.execute('INSERT INTO `Answers` (userId,questionId,choiceIds,timer,correct) VALUES (?,?,?,?,?)', [req.session.user.id, question.ID, response.choiceIds, dateFormat, dataValidChoice], function (error, results, fileds) {
                            if (error) throw error;
                            else {
                                console.log("response ", response)
                                console.log("user ", req.session.user)
                                console.log("question ", req.session.user.questions[response.categoryId][response.questionId])

                                req.session.user.currentTimestamp = Date.now()
                                saveTimerUser(req.session.user)

                                req.session.user.questions[response.categoryId][response.questionId].answer = {
                                    ID: results.insertId,
                                    choiceIds: response.choiceIds
                                }
                                console.log("value in questions[0]", req.session.user.questions.slice(0,1))
                                console.log("current Category ",req.session.user.navigator.currentCategory)
                                console.log("current Question ",req.session.user.navigator.currentQuestion)
                                console.log("Number of Category ",req.session.user.questions.length)
                                console.log("Number of Question ",req.session.user.questions[req.session.user.navigator.currentCategory].length)
                                console.log("isFinishAllQuestion ", isFinishAllQuestion(req.session.user))
                                console.log("timeQcmIsFinish ", timeQcmIsFinish(req.session.user))

                                if (isFinishAllQuestion(req.session.user)|| timeQcmIsFinish(req.session.user)) {
                                    req.session.user.finish = true
                                    db.execute('UPDATE `Users` SET `time` = ?, `finish` = ? WHERE ID = ?' ,[req.session.user.navigator.qcmTimer,req.session.user.finish,req.session.user.id], function (error, results, fields) {
                                        if (error) throw error;
                                        else
                                            console.log("in update")

                                    })
                                    //let text = ""
                                    //req.session.user.navigator.qcmTimer == 0? text = "Temps ecouler , le test et finis." : text = "Bravo, vous avez fini le test en répondent a toutes";
                                    return res.json({
                                        response: {
                                            sessionID: req.sessionID,
                                            finish: true,
                                        }, error: ""
                                    })
                                } else {
                                    // récupérer la catégorieId , la questionId et langage Id, pour généraliser la route.
                                    changeQuestion(req.session.user, nextQuestion.nextQuestionId, nextQuestion.nextCategoriId).then(newQuestion => {
                                        console.log("newQuestion ", newQuestion)
                                        db.execute('SELECT * FROM `Choice` WHERE `questionId` = ?', [newQuestion.ID], function (error, results, fields) {
                                            if (error) throw error;
                                            if (results.length > 0) {
                                                if (typeof newQuestion != "string") {
                                                    return res.json({
                                                        response: {
                                                            sessionID: req.sessionID,
                                                            question: newQuestion,
                                                            questionId: req.session.user.navigator.currentQuestion,
                                                            choice: results,
                                                            tiemstamp: req.session.user.currentTimestamp
                                                        }, error: ""
                                                    })
                                                }
                                                return res.json({response: "", error: newQuestion})
                                            } else
                                                return res.json({response: "", error: "Aucune choix n\'a était trouver."})
                                        });
                                    })
                                }
                            }
                        })
                    })

            } else
                return res.json({
                    response: "",
                    error: "Valeur ou/et syntax sont invalide " + validResponse.errorValue.toString()
                })
        }else if(req.session.user.start == false){
            return res.json({response: "", error: "Vous n'avez pas encore commencer le test."})
        }else{
            return res.json({
                response: {
                    sessionID: req.sessionID,
                    finish: true,
                }, error: ""
            })
            //return res.json({response: "", error: "Vous avez fini le test , vous en pouvez pas le recommencer !!"})
        }
    } else
        return res.redirect('/')
       // return res.json({response: "", error: "Vous n'êtes pas connecté à un compte."})
})

router.get('/question', function (req, res, next) {
    console.log(req.query)
    changeQuestion(req.session.user, nextQuestion.nextQuestionId, nextQuestion.nextCategoriId).then(newQuestion => {
        console.log("newQuestion ", newQuestion)
        db.execute('SELECT * FROM `Choice` WHERE `questionId` = ?', [newQuestion.ID], function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                if (typeof newQuestion != "string") {
                    return res.json({
                        response: {
                            sessionID: req.sessionID,
                            question: newQuestion,
                            questionId: req.session.user.navigator.currentQuestion,
                            choice: results,
                            tiemstamp: req.session.user.currentTimestamp
                        }, error: ""
                    })
                }
                return res.json({response: "", error: newQuestion})
            } else
                return res.json({response: "", error: "Aucune choix n\'a était trouver."})
        });
    })
})

// =================================================================
/**
 *
 * @param catgeroyId
 * @param langIds
 * @returns {Promise<any>}
 */
function generateQuestionsByCategory(catgeroyId, langIds) {
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
    console.log("CategoryId",catgeroyId)
    console.log("queryLangId ",queryLangId)
    console.log("queryLangId condition ", queryLangId != "")
    return new Promise((resolve, reject) => {

        if(queryLangId != ""){
            db.execute('SELECT * FROM `Question` WHERE  `categoryId` = ?  AND ' + queryLangId + ' ORDER BY RAND(), langId LIMIT 5',[catgeroyId], function (error, results, fields) {
                if (error)reject({response: "", error: error});

                if (results.length > 0) {
                    console.log("results ", results)
                    return resolve(results)
                } else
                    return reject({response: "", error: "Aucune question n\'a était trouver 2."})
            })
        } else{
            db.execute('SELECT * FROM `Question` WHERE  `categoryId` = ? ORDER BY RAND() LIMIT 5',[catgeroyId], function (error, results, fields) {
                if (error) reject({response: "", error: error});

                if (results.length > 0) {
                    console.log("results ", results)
                    return resolve(results)
                } else
                    return reject({response: "", error: "Aucune question n\'a était trouver 1."})
            })
        }
    })
}

/**
 *
 * @param startTimestamp
 * @param currentTimestamp
 * @returns {boolean}
 */
function timeQcmIsFinish (objectUser){
    let time = objectUser.navigator.qcmTimer.split(":")
    if(parseInt(time[1]) == 0 && parseInt(time[2]) == 0){
        return true;
    }
    return false;
}

/**
 *
 * @param objectUser
 * @returns {boolean}
 */
function isFinishAllQuestion (objectUser){
    console.log("objectUser ",objectUser)
    if( objectUser.questions[objectUser.navigator.allCategoriesExists.length] == undefined){
        return false;
    }else{
        let lastQuestionId = objectUser.questions[objectUser.navigator.allCategoriesExists.length].length

        if(objectUser.questions[objectUser.navigator.allCategoriesExists.length] == null){
            console.log("the last Category have not object")
        }else{
            console.log(objectUser.questions[objectUser.navigator.allCategoriesExists.length][lastQuestionId-1])
            console.log(objectUser.navigator.currentQuestion)
            if(objectUser.navigator.allCategoriesExists.length == objectUser.navigator.currentCategory && objectUser.navigator.currentQuestion == objectUser.questions[objectUser.navigator.currentCategory].length -1){
                return true;
            }
        }
    }
    return false;
}


/**
 *
 * @param object
 */
function saveTimerUser(object){

    let minutes = Math.abs(new Date(object.currentTimestamp).getMinutes() - new Date(object.startTimestamp).getMinutes() - 30)-1
    let seconds = Math.abs(new Date(object.currentTimestamp).getSeconds() - new Date(object.startTimestamp).getSeconds() - 60)
    if(minutes <= 0){
        minutes == "00"
    }
    if(seconds >= 60){
        seconds = 59
    }
    let timeFormat = "00:"+minutes+":"+seconds
    console.log("timeFormat ", timeFormat)
    console.log("Time formart = ",object.navigator.qcmTimer)
    object.navigator.qcmTimer = timeFormat;
    console.log("before update")
    db.execute('UPDATE `Users` SET `time` = ?  WHERE ID = ?' ,[object.navigator.qcmTimer,object.id], function (error, results, fields) {
        if (error) throw error;
        else
            console.log("in update")
    })
    console.log("after update")
}

/**
 *
 * @param userChoices
 * @param questionsId
 * @returns {Promise<any>}
 */
function isValidChoiceForTheQuestion(userChoices, questionsId) {
    return new Promise((resolve, reject) => {
        console.log("============== DEBUG is Valid Choice ===============")
        db.execute('SELECT `rightAnswer` FROM `Choice` WHERE  `questionId` = ? ', [questionsId], function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                let numberChoiceIsValid = 0;
                let validChoice = 0;
                console.log("results", results)
                console.log("user choice ",userChoices)
                results.forEach(choice => {
                    if (choice.rightAnswer == 1)
                        numberChoiceIsValid += 1
                })
                userChoices.forEach(userChoice => {
                    console.log("userChoice =",userChoice)
                    console.log("results[userChoice-1] = ",results[userChoice-1])
                    if(results[userChoice-1].rightAnswer == 1){
                        validChoice += 1;
                    }
                })
                console.log("numberChoiceIsValid ",numberChoiceIsValid)
                console.log("validChoice ",validChoice)
                console.log("userChoices length ",userChoices.length)
                console.log("numberChoiceIsValid == validChoice",numberChoiceIsValid == validChoice)
                console.log("numberChoiceIsValid == userChoices.length", numberChoiceIsValid == userChoices.length)
                if (numberChoiceIsValid == validChoice && numberChoiceIsValid == userChoices.length)
                    return resolve(1)
                else
                    return resolve(0)
            } else
                return reject({response: "", error: "Aucune question n\'a était trouver."})
            console.log("================================================")
        })
    })
}

/**
 *
 * @param response
 * @param sessionId
 * @returns {{isValid: boolean, errorValue: Array}}
 */
function checkValidResponse(response, sessionId) {
    let check = {
        isValid: false,
        errorValue: []
    }
    if (typeof response == "object") {
        if (Object.keys(response).length == 4) {
            let validKeyName = 0
            let validValue = 0

            for (key in response) {
                if (key == "categoryId" || key == "questionId" || key == "choiceIds" || key == "sessionId") {
                    validKeyName += 1;
                } else
                    check.errorValue.push(key)
            }

            for (key in response) {
                if (key == "questionId" || key == "categoryId") {
                    if (typeof response[key] == "number")
                        validValue += 1
                    else
                        check.errorValue.push("(int)" + key)
                }
                if (key == "choiceIds") {
                    if (Array.isArray(response[key]))
                        validValue += 1
                    else
                        check.errorValue.push("(Array)" + key + "")
                }
            }

            if (validKeyName == 4 && validValue == 3) {
                check.isValid = true;
                return check;
            }
        } else
            check.errorValue.push("(unknown data)")
    } else
        check.errorValue.push("(object response)")
    return check
}

//  Function for object req.user.session
/**
 *
 * @param object
 * @param checkValue
 * @returns {boolean}
 */
function isVaildCategory(object, checkValue) {
    if (/^[0-9]+$/.test(checkValue)) {
        let isValid = false;
        object.navigator.allCategoriesExists.forEach(category => {
            if (category.ID == parseInt(checkValue))
                isValid = true
        })
        return isValid
    } else if (/^[a-zA-Z]+$/.test(checkValue)) {
        let isValid = false;
        object.navigator.allCategoriesExists.forEach(category => {
            if (category.categoryName == checkValue)
                isValid = true
        })
        return isValid
    }
    return false
}

/**
 *
 * @param object
 * @param questionId
 * @param categoryId
 * @returns {boolean}
 */
function isVaildQuestionId(object, questionId, categoryId) {
    if (object.questions[categoryId][questionId] != undefined) {
        return true
    }
    return false
}

/**
 *
 * @param object
 * @param categoryId
 * @returns {boolean}
 */
function changeCategory(object, categoryId) {
    return new Promise((resolve, reject) => {
        if (isVaildCategory(object, categoryId)) {
            let iterator = object.questions.keys();
            let findKey = false;
            for (key of iterator) {
                if (key == categoryId) {
                    findKey = true;
                    break;
                }
            }
            if (!findKey) {
                generateQuestionsByCategory(categoryId, object.languages)
                    .then(result => {
                        object.questions[categoryId] = result
                        return resolve(true);
                    })
                    .catch(error => {
                        console.error(error)
                        return resolve(false);
                    })
            }
            object.navigator.currentCategory = categoryId;
        } else {
            return resolve(false);
        }
    })
}

/**
 *
 * @param object
 * @param questionId
 * @param catgeoryId
 * @returns {*}
 */
function changeQuestion(object, questionId, catgeoryId) {
    return new Promise((resolve, reject) => {
        console.log("nbQuestion ",object.questions[catgeoryId].length)
        console.log("nbQuestion ",object.navigator.currentQuestion)
        if (object.questions[catgeoryId] == undefined) {
            changeCategory(object, catgeoryId).then(result=>{
                if (result) {
                    object.navigator.currentCategory = catgeoryId
                    object.navigator.currentQuestion = 0
                    return resolve(object.questions[catgeoryId][0])
                }
                return reject("Catégorie invalide")
            })
        } else if (object.questions[catgeoryId].length-1 == object.navigator.currentQuestion) {
            changeCategory(object, catgeoryId + 1).then(result=>{
                if (result) {
                    console.log("")
                    object.navigator.currentCategory = catgeoryId + 1
                    object.navigator.currentQuestion = 0
                    return resolve(object.questions[catgeoryId + 1][0])
                }
                return reject("Catégorie invalide")
            })
        } else {
            console.log("isVaildCategory ", isVaildCategory(object, catgeoryId))
            console.log("isVaildQuestionId ", isVaildQuestionId(object, questionId, catgeoryId))
            if (isVaildCategory(object, catgeoryId) && isVaildQuestionId(object, questionId, catgeoryId)) {
                object.navigator.currentCategory = catgeoryId
                object.navigator.currentQuestion = questionId
                return resolve(object.questions[catgeoryId][questionId])
            }
            return reject("categoryId ou questionId Invalide")
        }
    })
}

module.exports = router;