var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var uri = 'mongodb+srv://admin:tYFofQJbk98w31OR@cluster0-baxfc.mongodb.net/project';

//routes
router.get('/', (req, resp) => {
    if(req.session.admin) {
        resp.redirect('home');
    } else {
        resp.redirect('login');
    }
});

router.get('/login', (req, resp) => {
    if(req.session.admin) {
        resp.redirect('home');
    } else {
        resp.render('../views/admin/login.ejs');
    }
});

router.post('/login', (req, resp) => {
    var username = req.body.username;
    var password = req.body.password;
    var crypto = require('crypto');
    var pwdhash = crypto.createHash('md5').update(password).digest("hex");

    MongoClient.connect(uri, (err, conn) => {
        if(err) throw err;
        var db = conn.db('project');
        var query = { username: username, passwordhash: pwdhash };
        db.collection('admins').findOne(query, (err, result) => {
            if(err) throw err;
            if(result) {
                req.session.admin = result;
                resp.redirect('home');
            } else {
                resp.redirect('login');
            }
            conn.close();
        });
    });
});


router.get('/home', (req, resp) => {
    if(req.session.admin) {
        resp.render('../views/admin/home.ejs');
    } else {
       resp.redirect('login');
    }
});

router.get('/logout', (req, resp) => {
    delete req.session.admin;
    resp.redirect('login');
});

module.exports = router;