var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/upload',function (req, res, next) {
    res.render('upload',{ title: 'Upload File' });
})

router.post('/upload', function(req, res, next) {
    if (Object.keys(req.files).length == 0) {
        return res.status(400).send('Le fichier n\'a pas pu être uploader.');
    }
    let file = req.files.fileToUpload

    if(file.mimetype != "application/json"){
        return res.status(400).send("Le fichier n\'est pas un JSON");
    }
    try {
        JSON.parse(file.data.toString())
    }catch (e) {
        return res.status(400).send("Le fichier , a une syntax JSON invalide !");
    }

    dataTranformJSONToInsertQuestionInDB(JSON.parse(file.data.toString()))

    res.send('Fichier uploader sur le serveur.');
});

/**
 *
 * @param json
 */
function dataTranformJSONToInsertQuestionInDB(json){
    getInformationDatabaseLangauagesAndCategories().then(response=>{
        // on parcour tout les question pour récupérer les information
        json.forEach((questions)=>{
            let keys = Object.keys(questions)
            console.log("Key = ", keys)
            keys.forEach(key=>{
                db.execute('SELECT  FROM `Question` WHERE jsonId = ?',[key],function (error,results,fields){
                    if (error) throw error;
                    if(results.length > 0){

                    }else{
                        let categoryId  = response.categories.filter(category=> category.categoryName == questions[key].category)[0].ID
                        let langId;
                        if(questions[key].language != "")
                            langId = response.languages.filter(category=> category.languageName == questions[key].language)[0].ID
                        else
                            langId = "NULL"
                        db.execute('INSERT INTO `Question` (questionText, categoryId, langId, difficulty, jsonId) VALUES (?,?,?,?,?)',[questions[key].question, categoryId, langId, questions[key].level, key],function (error,results,fields) {
                            if (error) throw error;
                            else{
                                dataTranformJSONToInsertChoicesInDB(questions[key].answers, results.insertId);
                            }
                        })
                    }
                })
            })
        })
    })
}

/**
 *
 * @param json
 * @param questionId
 */
function dataTranformJSONToInsertChoicesInDB(json, questionId){
    console.log("=========== [DEBUG choice json forEach ] ===========")
    json.forEach(choice=>{
        db.execute('INSERT INTO `Choice` (textResponse, questionId, rightAnswer) VALUES (?,?,?)',[choice.answer, questionId, choice.right],function (error,results,fields) {
            if (error) throw error;
            else{

            }
        })
    })
}

/**
 *
 * @returns {Promise<any>}
 */
function getInformationDatabaseLangauagesAndCategories(){
    return new Promise((resolve, reject) => {
        let languages
        db.execute('SELECT * FROM `ProgLanguage`', function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                languages = results
            } else
                reject("Erreur, aucun langage trouver")
        })

        db.execute('SELECT * FROM `Categories`', function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                resolve({
                    languages:languages,
                    categories:results
                });
            } else
                reject("Erreur, aucun langage trouver")
        })
    })
}

module.exports = router;
