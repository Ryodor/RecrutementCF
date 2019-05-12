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
                    return reject({response: "", error: "Aucune question n\'a été trouvée 2."})
            })
        } else{
            db.execute('SELECT * FROM `Question` WHERE  `categoryId` = ? ORDER BY RAND() LIMIT 5',[catgeroyId], function (error, results, fields) {
                if (error) reject({response: "", error: error});

                if (results.length > 0) {
                    console.log("results ", results)
                    return resolve(results)
                } else
                    return reject({response: "", error: "Aucune question n\'a été trouvée 1."})
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
            console.log(objectUser.questions[objectUser.navigator.allCategoriesExists.length][lastQuestionId])
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
                return reject({response: "", error: "Aucune question n\'a été trouvée."})
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
            return reject("categoryId ou questionId invalide")
        }
    })
}