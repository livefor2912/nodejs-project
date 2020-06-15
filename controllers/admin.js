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
var ZoneDAO = require(pathDAO + "/ZoneDAO.js");
var OrderDAO = require(pathDAO + "/OrderDAO.js");
var CategoryDAO = require(pathDAO + "/CategoryDAO.js");
var ProductDAO = require(pathDAO + "/ProductDAO.js");
var CustomerDAO = require(pathDAO + "/CustomerDAO.js");

router.use((req, res, next) => {
    if (!req.session.admin && !req.originalUrl.endsWith('/login')) {
        res.redirect('/admin/login');
    }
    else {
        next();
    }
});

//routes
// router.get('/', (req, resp) => {
//     resp.redirect('home');
// });

router.get('/login', (req, resp) => {
    resp.render('admin/login');
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
    resp.render('admin/home');
});

router.get('/logout', (req, resp) => {
    delete req.session.admin;
    resp.redirect('login');
});

router.get("/listproducts", async (req, resp) => {
    // MongoClient.connect(uri, (err, conn) => {
    //     if(err) throw err;
    //     var db = conn.db('project');
    //     var query = {};
    //     db.collection('products').find(query).toArray((err, result) => {
    //         if(err) throw err;
    //         if(result) {
    //             resp.render('admin/home', {listProduct: result})
    //         } else {
    //             resp.render('admin/home');
    //         }
    //         conn.close();
    //     });
    // });
    var list = await ProductDAO.selectAll();
    resp.render('admin/listproducts', { listProduct: list });

});

router.get("/addproduct", async (req, resp) => {
    var list = await CategoryDAO.selectAll2();
    resp.render('admin/addproduct', { categories: list });
});
router.post("/addproduct", upload.single('image'), async (req, resp) => {
    var name = req.body.name;
    var price = req.body.price;
    var amount = req.body.amount;
    var category = req.body.category;
    var time = new Date().getTime();
    // var image = req.body.image;
    var image = req.file.buffer.toString('base64');
    var products = { name: name, price: price, amount: amount, category: category, image: 'data:image/png;base64,' + image, creationDate: time };
    var result = await ProductDAO.insert(products);
    if (result) {
        resp.redirect('/admin/listproducts');
    } else {
        resp.redirect('/admin/addproduct');
    }
});

router.get('/listzones', (req, resp) => {

});
router.get('/listcate', async function (req, res) {
    var categories = await CategoryDAO.selectAll();
    res.render('../views/admin/listcate.ejs', { cats: categories });
});
router.post('/addcate', async function (req, res) {
    var name = req.body.name;
    var category = { name: name };
    var result = await CategoryDAO.insert(category);
    if (result) {
        MyUtil.showAlertAndRedirect(res, 'Successfully!!', './listcate');
    } else {
        MyUtil.showAlertAndRedirect(res, 'Oh no sorry bae', './listcate');
    }
});
router.post('/updatecate', async function (req, res) {
    var _id = req.body.id;
    var name = req.body.name;
    var category = { _id: _id, name: name };
    var result = await CategoryDAO.update(category);
    if (result) {
      MyUtil.showAlertAndRedirect(res, 'Successfully!!', './listcate');
    } else {
      MyUtil.showAlertAndRedirect(res, 'Oh no sorry bae', './listcate');
    }
  });
  router.post('/deletecate', async function (req, res) {
    var _id = req.body.id;
    var result = await CategoryDAO.delete(_id);
    if (result) {
      MyUtil.showAlertAndRedirect(res, 'Successfully!!', './listcate');
    } else {
      MyUtil.showAlertAndRedirect(res, 'Oh no sorry bae', './listcate');
    }
  });
module.exports = router;