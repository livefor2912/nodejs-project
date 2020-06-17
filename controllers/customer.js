var express = require('express');
var router = express.Router();

//var MongoClient = require('mongodb').MongoClient;
//var uri = 'mongodb+srv://admin:tYFofQJbk98w31OR@cluster0-baxfc.mongodb.net/project';

var MyUtil = require("../utils/MyUtil.js");
var multer = require('multer');
const { ObjectID, ObjectId } = require('mongodb');

var pathDAO = "../daos/mongodb";
//var pathDAO = "../daos/mongoose";
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
  // var pwdhashed = MyUtil.md5(password);
  //var cus = await CustomerDAO.sele
  var remember = req.body.remember;
  var cus = await CustomerDAO.selectByUsernameAndPassword(username, password);
  // var temp = CustomerDAO.test();
  if (cus) {
      req.session.customer = cus;
      resp.redirect('/');
  } else {
      MyUtil.showAlertAndRedirect(resp, 'Invalid login!', './login');
  }
});

router.get('/myorders', async function (req, resp) {
    var cust = req.session.customer;
    if (cust) { 
      var orders = await OrderDAO.selectByCustID(cust._id);
      var _id = req.query.id; // /myorders?id=XXX
      if (_id) {
        var order = await OrderDAO.selectByID(_id);
      } 
      resp.render('../views/customer/myorders.ejs', { orders: orders, order: order});
    } else {
      resp.redirect('./');
    }
  });
module.exports = router;
