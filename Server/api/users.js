var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    db.query('SELECT name, id FROM users', function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
});

router.post('/login', function(req, res, next) {
    console.log(req)
    user = req.body
    db.query('SELECT name, email, id FROM `users` WHERE `email`='+user.email+' AND `userPassword`='+user.password, function (error, results, fields) {
        if (error) throw error;
        res.send(results);
    });
});

module.exports = router;
