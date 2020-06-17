var express = require('express');
var router = express.Router();
var objectId = require('mongodb').ObjectID;

var MyUtil = require("../utils/MyUtil.js");
var multer = require('multer');

var pathDAO = "../daos/mongodb";
// var pathDAO = "../daos/mongoose";
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
        cats: categories, newprods: newproducts, hotprods: hotproducts, zones: zones
        , listProduct: list
    });
});

router.get('/zone', async (req, resp) => {
    var categories = await CategoryDAO.selectAll();
    var zones = await ZoneDAO.selectAll();
    var zoneId = req.query.zoneID;
    var list = await ProductDAO.selectByZoneID(zoneId);
    var zone = await ZoneDAO.selectByID(zoneId);

    resp.render('../views/customer/zone.ejs', { cats: categories, zones: zones, listProduct: list, zone: zone});
});

router.get('/myprofile', async function (req, resp) {
    var categories = await CategoryDAO.selectAll();
    var zones = await ZoneDAO.selectAll();
    resp.render('../views/customer/myprofile.ejs', { cats: categories, zones: zones });
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
            MyUtil.showAlertAndRedirect(resp, 'Update successful!', './');
        }
    } else MyUtil.showAlertAndRedirect(resp, 'SORRY!', './myprofile');
});

module.exports = router;