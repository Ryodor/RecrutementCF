let express = require('express');
let router = express.Router();

router.get('/', function (req, res, next) {
    res.send("Il n'y a rien ici :)")
})

router.get('/start', function (req, res, next) {
    //if(req.user){
    /* Creation  d'un template de QCM est l'envoie en json */
    let Categories;
    let Langages;
    let question;

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

    if (!req.user.start) {
        generateQuestionsByCategory(1, [1, 2])
            .then(question => {
                console.log("[DEBUG] question1 ", question)
                req.user.start = true
                req.user.questions[0] = question

                db.execute('SELECT * FROM `Choice` WHERE `questionId` = ?', [question[0].ID], function (error, results, fields) {
                    if (error) throw error;

                    if (results.length > 0) {
                        return res.send({
                            response: {
                                sessionID: req.sessionID,
                                categories: Categories,
                                langages: Langages,
                                question: question[0],
                                choice: results
                            }, error: ""
                        });
                    } else
                        return res.json({response: "", error: "Aucune choix n\'a était trouver."})
                })
            })
            .catch(error => {
                console.log(error)
            })
    } else
        return ""
    //}else
    //    return res.send({response:"",error:"Vous n'êtes pas connecter a un compte."})

})

router.post('/question', function (req, res, next) {
    //if(req.user){
    let response = req.body.response;
    let nextQuestion = req.body.nextQuestion;
    if (typeof response != "object")
        response = JSON.parse(response);

    let validResponse = checkValidResponse(response);
    if (validResponse.isValid) {

        //  Verifier que les choiceIds corésponde avec les réponse possible de la question (utilise rune fonction)
        isValidChoiceForTheQuestion(response.choiceIds, response.questionId)
            .then(results => {
                db.execute('INSERT INTO `Answers` (userId,questionId,choiceIds,timer,correct) VALUES (?,?,?,?,?)', [req.user.id, response.questionId, response.choices, response.timer, results], function (error, results, fileds) {
                    if (error) throw error;
                    else {
                        req.user.questions[response.categoriId][response.questionId]
                    }
                })
            })

        // récupérer la catégorieId , la questionId et langage Id, pour généraliser la route.
        db.execute('SELECT * FROM `Choice` WHERE `questionId` = ?', [nextQuestion.questionId], function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                let newQuestion = req.user.questions.changeQuestion(nextQuestion.categoriId,nextQuestion.questionId)
                if(typeof newQuestion != "string"){
                    return res.send({
                        response: {
                            sessionID: req.sessionID,
                            question: newQuestion,
                            choice: results
                        }, error: ""
                    })
                }
                return res.json({response: "", error: newQuestion})
            }else
                return res.json({response: "", error: "Aucune choix n\'a était trouver."})
        });

    } else
        return res.json({
            response: "",
            error: "Valeur ou/et syntax sont invalide " + validResponse.errorValue.toString()
        })
    //}else
    //    return res.json({response:"",error:"Vous n'êtes pas connecté à un compte."})
})

router.get('/question/:id', function (req, res, next) {

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

    let executeQuery = ""
    queryLangId != "" ? executeQuery = 'SELECT * FROM `Question` WHERE  `categoryId` = ? ' + queryLangId + ' ORDER BY RAND(), langId LIMIT 5': executeQuery = 'SELECT * FROM `Question` WHERE  `categoryId` = ? ORDER BY RAND(), langId LIMIT 5'

    console.log("[debug] queryLangId ", queryLangId)

    return new Promise((resolve, reject) => {
        db.execute(executeQuery, [catgeroyId], function (error, results, fields) {
            if (error) throw error;

            if (results.length > 0) {
                console.log(results)
                resolve(results)
            } else
                reject({response: "", error: "Aucune question n\'a était trouver."})
        })
    })
}

/**
 *
 * @param userChoices
 * @param questionsId
 * @returns {Promise<any>}
 */
function isValidChoiceForTheQuestion(userChoices, questionsId) {
    return new Promise((resolve, reject) => {
        db.execute('SELECT `rightAnswer` FROM `Choice` WHERE  `questionId` = ? ', [questionsId], function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                let numberIsValid = 0;
                let validChoice = 0;
                results.fitler(choice => choice.rightAnswer == 1 ? numberIsValid += 1 : "")
                results.forEach(choice => {
                    userChoices.forEach(userChoice => {
                        if (choice.rightAnswer == userChoice)
                            validChoice += 1;
                    })
                })
                if (numberIsValid == validChoice)
                    resolve(1)
                else
                    resolve(0)
            } else
                reject({response: "", error: "Aucune question n\'a était trouver."})
        })
    })
}

function checkValidResponse(response) {
    let check = {
        isValid: false,
        errorValue: []
    }
    if (typeof response == "object") {
        if (Object.keys(response).length == 4) {
            let validKeyName = 0
            let validValue = 0

            for (key in response) {
                if (key == "questionId" || key == "choiceIds" || key == "sessionId" || key == "timer") {
                    validKeyName += 1;
                } else
                    check.errorValue.push(key)
            }

            for (key in response) {
                if (key == "questionId") {
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

            if (validKeyName == 4 && validValue == 2) {
                check.isValid = true;
                return check;
            }
        } else
            check.errorValue.push("(unknown data)")
    } else
        check.errorValue.push("(object response)")
    return check
}

module.exports = router;