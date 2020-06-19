var express = require('express');
var router = express.Router();
//var app = express();
//var api = express.Router();
var expressValidator = require('express-validator');
router.use(expressValidator());

//var MongoClient = require('mongodb').MongoClient;
//var uri = 'mongodb+srv://admin:tYFofQJbk98w31OR@cluster0-baxfc.mongodb.net/project';

var MyUtil = require("../utils/MyUtil.js");
var multer = require('multer');

// var pathDAO = "../daos/mongodb";
var pathDAO = "../daos/mongoose";
var CategoryDAO = require(pathDAO + "/CategoryDAO.js");
var ProductDAO = require(pathDAO + "/ProductDAO.js");
var CustomerDAO = require(pathDAO + "/CustomerDAO.js");
var OrderDAO = require(pathDAO + "/OrderDAO.js");
var ZoneDAO = require(pathDAO + "/ZoneDAO.js");

router.get('/', async (req, resp) => {
    var categories = await CategoryDAO.selectAll();
    var newproducts = await ProductDAO.selectTopNew(3);
    var hotproducts = await ProductDAO.selectTopHot(3);
    var zones = await ZoneDAO.selectAll();
    resp.render('../views/customer/home.ejs', { cats: categories, newprods: newproducts, hotprods: hotproducts, zones: zones });
});

router.get('/register',(req, res) => {
    res.render('../views/customer/register.ejs');
});

router.post('/register',(req, res) => {
    const Username = req.body.username;
    const Password = req.body.password;
    const Password2 = req.body.Password2;
    const Name = req.body.Name;
    const phone = req.body.phone;
    const email = req.body.email;

    req.checkBody('Username','Username is required.').notEmpty();
    req.checkBody('Password','Password is required.').notEmpty();
    req.checkBody('Password2', 'Passwords do not match').equals(Password);
    req.checkBody('Name','Name is required.').notEmpty();
    req.checkBody('Email','Email is required.').notEmpty();
    req.checkBody('Email','Email is not valid.').isEmail();
    req.checkBody('Phone','Phone is required.').notEmpty();


});

router.get('/login', (req, resp) => {
    if(req.session.customer) {
        resp.redirect('/');
    } else {
        resp.render('../views/customer/login.ejs');
    }
});

router.post('/login', async (req, resp) => {
    var username = req.body.username;
    var password = req.body.password;
    var pwdhashed = MyUtil.md5(password);
    //var cus = await CustomerDAO.sele
    var remember = req.body.remember;
    var cus = CustomerDAO.selectByUsernameAndPassword(username, pwdhashed);
    if (cus) {
      req.session.customer = cus;
      resp.redirect('/');
    } else {
      MyUtil.showAlertAndRedirect(resp, 'Invalid login!', './login');
    }
});


module.exports = router;