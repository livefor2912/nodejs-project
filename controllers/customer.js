var express = require('express');
var router = express.Router();

//var app = express();
//var api = express.Router();
var expressValidator = require('express-validator');
router.use(expressValidator());

var objectId = require('mongodb').ObjectID;


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

router.get('/register', (req, res) => {
  res.render('../views/customer/register.ejs');
});

router.post('/register', (req, res) => {
  const Username = req.body.username;
  const Password = req.body.password;
  const Password2 = req.body.Password2;
  const Name = req.body.Name;
  const phone = req.body.phone;
  const email = req.body.email;

  req.checkBody('Username', 'Username is required.').notEmpty();
  req.checkBody('Password', 'Password is required.').notEmpty();
  req.checkBody('Password2', 'Passwords do not match').equals(Password);
  req.checkBody('Name', 'Name is required.').notEmpty();
  req.checkBody('Email', 'Email is required.').notEmpty();
  req.checkBody('Email', 'Email is not valid.').isEmail();
  req.checkBody('Phone', 'Phone is required.').notEmpty();
});

router.get('/login', async (req, resp) => {
  if (req.session.customer) {
    resp.redirect('/');
  } else {
    var categories = await CategoryDAO.selectAll();
    var zones = await ZoneDAO.selectAll();
    resp.render('../views/customer/login.ejs', { cats: categories, zones: zones });
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


//============== Order ================

router.get('/myorders', async function (req, resp) {
  if (req.session.customer) {
    var cust = req.session.customer;
    if (cust) {
      var orders = await OrderDAO.selectByCustID(cust._id);
      var _id = req.query.id; // /myorders?id=XXX
      if (_id) {
        var order = await OrderDAO.selectByID(_id);
      }
      resp.render('../views/customer/myorders.ejs', { orders: orders, order: order });
    } else {
      resp.redirect('./');
    }
  } else {
    resp.redirect('/login');
  }
});

//============== product ================

router.get("/listproducts", async (req, resp) => {
  var categories = await CategoryDAO.selectAll();
  var zones = await ZoneDAO.selectAll();
  var newproducts = await ProductDAO.selectTopNew(3);
  var hotproducts = await ProductDAO.selectTopHot(3);
  var list = null;
  if (req.query.catID) {
    list = await ProductDAO.selectByCatID(req.query.catID);
  } else {
    list = await ProductDAO.selectAll();
  }
  resp.render('../views/customer/listproducts.ejs', {
    cats: categories, newprods: newproducts, hotprods: hotproducts, zones: zones, listProduct: list
  });
});


router.get("/details", async (req, resp) => {
  var _id = req.query.id;
  var product = await ProductDAO.selectByID(_id);
  product.zone = await ZoneDAO.selectByID(objectId(product.idzone).valueOf());
  product.category = await CategoryDAO.selectByID(objectId(product.idcategory).valueOf());
  var categories = await CategoryDAO.selectAll();
  var zones = await ZoneDAO.selectAll();
  resp.render('../views/customer/details.ejs', { product: product, cats: categories, zones: zones });
});

router.get("/searchproduct", async (req, resp) => {
  var categories = await CategoryDAO.selectAll();
  var zones = await ZoneDAO.selectAll();
  var keyword = req.query.keyword;
  var result = await ProductDAO.selectByKeyword(keyword);
  resp.render('../views/customer/listproducts.ejs', {
    cats: categories, zones: zones, listProduct: result
  });
});

//============== zone ================

router.get('/zone', async (req, resp) => {
  var categories = await CategoryDAO.selectAll();
  var zones = await ZoneDAO.selectAll();
  var zoneId = req.query.zoneID;
  var list = await ProductDAO.selectByZoneID(zoneId);
  var zone = await ZoneDAO.selectByID(zoneId);

  resp.render('../views/customer/zone.ejs', { cats: categories, zones: zones, listProduct: list, zone: zone });
});

//============== profile ================

router.get('/myprofile', async function (req, resp) {
  if (req.session.customer) {
    var categories = await CategoryDAO.selectAll();
    var zones = await ZoneDAO.selectAll();
    resp.render('../views/customer/myprofile.ejs', { cats: categories, zones: zones });
  } else {
    resp.redirect('/login');
  }
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
      MyUtil.showAlertAndRedirect(resp, 'Update profile successfully!', './');
    }
  } else MyUtil.showAlertAndRedirect(resp, 'Update profile failed. Please check again', './myprofile');
});

//============== cart ================

router.get('/mycart', function (req, res) {
  if (req.session.mycart && req.session.mycart.length > 0) {
    var total = MyUtil.getTotal(req.session.mycart);
    res.render('../views/customer/mycart.ejs', { total: total });
  } else {
    res.redirect('./');
  }
});

router.post('/add2cart', async function (req, res) {
  var _id = req.body.txtID;
  var quantity = parseInt(req.body.txtQuantity);
  var product = await ProductDAO.selectByID(_id);
  // create empty cart if not exists in the session, otherwise get out mycart from the session
  var mycart = [];
  if (req.session.mycart) mycart = req.session.mycart;
  var index = mycart.findIndex(x => x.product._id == _id); // check if the _id exists in mycart
  if (index == -1) { // not found, push newItem
    var newItem = { product: product, quantity: quantity };
    mycart.push(newItem);
  } else { // increasing the quantity
    mycart[index].quantity += quantity;
  }
  req.session.mycart = mycart; // put mycart back into the session
  res.redirect('./');
});

router.get('/remove2cart', function (req, res) {
  if (req.session.mycart) {
    var mycart = req.session.mycart;
    var _id = req.query.id; // /remove2cart?id=XXX
    var index = mycart.findIndex(x => x.product._id == _id);
    if (index != -1) { // found, remove item
      mycart.splice(index, 1);
      req.session.mycart = mycart;
    }
  }
  res.redirect('./mycart');
});

router.get('/checkoutconfirm', async function (req, res) {
  if (req.session.customer) {
    var total = MyUtil.getTotal(req.session.mycart);
    res.render('../views/customer/checkout.ejs', { total: total });
  }
  else {
    res.redirect('./login');
  }
});
router.get('/checkout', async function (req, res) {
  if (req.session.customer) {
    var now = new Date().getTime(); // milliseconds
    var total = MyUtil.getTotal(req.session.mycart);
    var order = { cdate: now, total: total, status: 'PENDING', customer: req.session.customer, items: req.session.mycart };
    var result = await OrderDAO.insert(order);
    if (result) {
      delete req.session.mycart;
      res.redirect('./');
      // MyUtil.showAlertAndRedirect(res, 'Place Order Successfully!', './');
    } else {
      MyUtil.showAlertAndRedirect(res, 'Something wrong, please check again', './mycart');
    }
  } else {
    res.redirect('./login');
  }
});

router.get('/about', async (req, resp) => {
  var categories = await CategoryDAO.selectAll();
  var zones = await ZoneDAO.selectAll();
  resp.render('../views/customer/about.ejs', { cats: categories, zones: zones });
});

router.get('/partner', async (req, resp) => {
  var categories = await CategoryDAO.selectAll();
  var zones = await ZoneDAO.selectAll();
  resp.render('../views/customer/partner.ejs', { cats: categories, zones: zones });
});

module.exports = router;