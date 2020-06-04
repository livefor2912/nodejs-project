var express = require('express');
var router = express.Router();

// var MongoClient = require('mongodb').MongoClient;
// var uri = 'mongodb+srv://admin:tYFofQJbk98w31OR@cluster0-baxfc.mongodb.net/project';

// middleware
var multer = require('multer');
var upload = multer({});
// utils
var MyUtil = require("../utils/MyUtil.js");
var EmailUtil = require("../utils/EmailUtil.js");
// daos
//var pathDAO = "../daos/mongodb";
var pathDAO = "../daos/mongodb";
var AdminDAO = require(pathDAO + "/AdminDAO.js");
var OrderDAO = require(pathDAO + "/OrderDAO.js");
var CategoryDAO = require(pathDAO + "/CategoryDAO.js");
var ProductDAO = require(pathDAO + "/ProductDAO.js");
var CustomerDAO = require(pathDAO + "/CustomerDAO.js");

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

router.post('/login', async (req, resp) => {
    var username = req.body.username;
    var password = req.body.password;
    var pwdhashed = MyUtil.md5(password);
    var admin = await AdminDAO.selectByUsernameAndPassword(username, pwdhashed);
    if (admin) {
      req.session.admin = admin;
      resp.redirect('home');
    } else {
      MyUtil.showAlertAndRedirect(resp, 'Invalid login!', './login');
    }
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