let express = require('express');
let router = express.Router();

router.get('/', function (req, res, next) {

    /* Creation  d'un template de QCM est l'envoie en json */
    db.execute('SELECT * FROM `Choice`,`Question` WHERE `Choice`.`questionId` = `Question`.`ID` AND `Question`.`ID` = 1',function(error, results, fields){
        if (error) throw error;

        if (results.length > 0) {
            return res.send({
                response: {
                    sessionID: req.sessionID,
                    question: results
                }, error: ""
            });
        }else
            return res.send({response:"",error:"Aucune question n\'a était trouver."})
    })

})
//b.execute
router.get('/start', function (req, res, next) {

    /* Creation  d'un template de QCM est l'envoie en json */
    let Categories;
    let Questions;
    let Choice;

    db.execute('SELECT * FROM `Categories` ',function(error, results, fields){
        if (error) throw error;
        else if(results.length > 0){
            Categories = results;
        }
    })

    db.execute('SELECT * FROM `Question` WHERE  `categoryId` = ?', [1],function(error, results, fields) {
        if (error) throw error;

        if (results.length > 0) {

        }else
            return res.send({response:"",error:"Aucune question n\'a était trouver."})
    })

    db.execute('SELECT * FROM `Choice` WHERE `questionId` = ?', [1],function(error, results, fields){
        if (error) throw error;

        if (results.length > 0) {
            return res.send({
                response: {
                    sessionID: req.sessionID,
                    categories : Categories,
                    question: results
                }, error: ""
            });
        }else
            return res.send({response:"",error:"Aucune question n\'a était trouver."})
    })

})


module.exports = router;