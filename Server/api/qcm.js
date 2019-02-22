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

        db.execute('SELECT * FROM `Categories` ',function(error, results, fields){
            if (error) throw error;
            else if(results.length > 0){
                Categories = results;
            }
        })

        db.execute('SELECT * FROM `ProgLanguage` ',function(error, results, fields){
            if (error) throw error;
            else if(results.length > 0){
                Langages = results;
            }
        })


        generateQuestionsByCategory(1,[1,2])
            .then(question=>{
                console.log("[DEBUG] question1 ",question)

                db.execute('SELECT * FROM `Choice` WHERE `questionId` = ?', [question[0].ID],function(error, results, fields){
                     if (error) throw error;

                     if (results.length > 0) {
                         return res.send({
                             response: {
                                 sessionID: req.sessionID,
                                 categories : Categories,
                                 langages : Langages,
                                 question: question[0],
                                 choice: results
                             }, error: ""
                         });
                     }else
                         return res.send({response:"",error:"Aucune choix n\'a était trouver."})
                })
            })
            .catch(error=>{
                console.log(error)
            })
    //}else
    //    return res.send({response:"",error:"Vous n'êtes la connecter a un compte."})

})

router.get('/question/:id', function (req, res, next) {

})

// =================================================================

function generateQuestionsByCategory(catgeroyId,langIds){
    let queryLangId = "";
    if(langIds.length > 1){
        queryLangId += "("
        langIds.forEach((lang, index)=>{
            if(index == langIds.length-1)
                queryLangId += "langId = "+lang
            else
                queryLangId += "langId = "+lang+" OR "
        })
        queryLangId += ")"
    }else
        queryLangId = langIds[0]

    console.log("[debug] queryLangId ",queryLangId)
    return new Promise((resolve, reject) => {
        db.execute('SELECT * FROM `Question` WHERE  `categoryId` = ? '+queryLangId+' ORDER BY RAND(), langId LIMIT 5', [catgeroyId],function(error, results, fields) {
            if (error) throw error;

            if (results.length > 0) {
                console.log(results)
                resolve(results)
            }else
                 reject({response:"",error:"Aucune question n\'a était trouver."})
        })
    })
}

module.exports = router;