var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var uri = 'mongodb+srv://admin:tYFofQJbk98w31OR@cluster0-baxfc.mongodb.net/project';

router.get('/', (req, resp) => {
    resp.render('../views/customer/home.ejs');
});

module.exports = router;