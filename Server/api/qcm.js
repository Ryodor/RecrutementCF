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
db.execute
router.get('/start', function (req, res, next) {

    db.execute('SELECT * FROM `Categories` WHERE `ID` = ?',[1],function(error, results, fields){

    })
    /* Creation  d'un template de QCM est l'envoie en json */
    db.execute('SELECT * FROM `Choice`,`Question` WHERE `Choice`.`questionId` = `Question`.`ID` AND `Question`.`categoryId` = ?', [1],function(error, results, fields){
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


module.exports = router;