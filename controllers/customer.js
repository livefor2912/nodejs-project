var express = require('express');
var router = express.Router();

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
    var cus = await CustomerDAO.selectByUsernameAndPassword(username, pwdhashed);
    // var temp = CustomerDAO.test();
    if (cus) {
      req.session.customer = cus;
      resp.redirect('/');
    } else {
      MyUtil.showAlertAndRedirect(resp, 'Invalid login!', './login');
    }
});
router.get('/myprofile', function (req, resp) {
    resp.render('../views/customer/myprofile.ejs');
  });

  router.post('/myprofile', async function (req, resp) {
    var curCust = req.session.customer;
    if (curCust) {
      var username = req.body.txtUsername;
      var password = req.body.txtPassword;
      var name = req.body.txtName;
      var phone = req.body.txtPhone;
      var email = req.body.txtEmail;
      var newCust = { _id: curCust._id, username: username, password: password, name: name, phone: phone, email: email, active: curCust.active, token: curCust.token };
      var result = await CustomerDAO.update(newCust);
      if (result) {
        req.session.customer = newCust;
        MyUtil.showAlertAndRedirect(resp, 'Update successful!', './home');
      }
    }
    MyUtil.showAlertAndRedirect(resp, 'SORRY!', './myprofile');
  });

module.exports = router;