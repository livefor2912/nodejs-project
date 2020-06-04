var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var uri = 'mongodb+srv://admin:tYFofQJbk98w31OR@cluster0-baxfc.mongodb.net/project';

router.use((req, res, next) => {
    if (!req.session.admin && !req.originalUrl.endsWith('/login')) {
        res.redirect('/admin/login');
    }
    else {
        next();
    }
});

// //routes
// router.get('/', (req, resp) => {
//     resp.redirect('home');
// });

router.get('/login', (req, resp) => {
    resp.render('admin/login');
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
                resp.redirect('/');
            }
            conn.close();
        });
    });
});


router.get('/home', (req, resp) => {
    resp.render('admin/home');
});

router.get('/logout', (req, resp) => {
    delete req.session.admin;
    resp.redirect('login');
});

router.get("/product", (req, resp) => { 
    MongoClient.connect(uri, (err, conn) => {
        if(err) throw err;
        var db = conn.db('project');
        var query = {};
        db.collection('products').find(query).toArray((err, result) => {
            if(err) throw err;
            if(result) {
                resp.render('admin/home', {listProduct: result})
            } else {
                resp.render('admin/home');
            }
            conn.close();
        });
    });
});
module.exports = router;