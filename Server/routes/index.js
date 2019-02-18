var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('Bienvenue sur l\'API de la Coding Factory');
});

module.exports = router;
