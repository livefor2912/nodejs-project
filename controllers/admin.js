var express = require('express');
var router = express.Router();
var objectId = require('mongodb').ObjectID;

// var MongoClient = require('mongodb').MongoClient;
// var uri = 'mongodb+srv://admin:tYFofQJbk98w31OR@cluster0-baxfc.mongodb.net/project';

// middleware
var multer = require('multer');
var upload = multer({});
// utils
var MyUtil = require("../utils/MyUtil.js");
var EmailUtil = require("../utils/EmailUtil.js");
// daos
// var pathDAO = "../daos/mongodb";
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
    var list = await ProductDAO.selectAll();
    var pageCount = list.length / 4;
    var page = req.query.page || 1;
    page = parseInt(page.toString());
    var offset = (page - 1) * 4;
    var end = (page * 4) <= list.length ? (page * 4) : list.length;
    resp.render('admin/listproducts', { listProduct: list.slice(offset, end), pageCount });
});

router.get("/addproduct", async (req, resp) => {
    var list = await CategoryDAO.selectAll2();
    var zones = await ZoneDAO.selectAll();
    resp.render('admin/addproduct', { categories: list, Zones: zones });
});

router.post("/addproduct", upload.single('image'), async (req, resp) => {
    var name = req.body.name;
    var price = req.body.price;
    var amount = req.body.amount;
    var category = await CategoryDAO.selectByID(req.body.category);
    var zone = null;
    if (req.body.zone)
        zone = await ZoneDAO.selectByID(req.body.zone);
    var time = new Date().getTime();
    // var image = req.body.image;
    var image = req.file.buffer.toString('base64');
    var products = { name: name, price: price, amount: amount, category: category, image: 'data:image/png;base64,' + image, creationDate: time, zone: zone };
    var result = await ProductDAO.insert(products);
    if (result) {
        resp.redirect('/admin/listproducts');
    } else {
        resp.redirect('/admin/addproduct');
    }
});
router.post('/editproduct', upload.single('image'), async (req, resp) => {
    var name = req.body.name;
    var price = req.body.price;
    var amount = req.body.amount;
    var category = await CategoryDAO.selectByID(req.body.category);
    var zone= null;
    if (req.body.zone)
        zone = await ZoneDAO.selectByID(req.body.zone);
    var time = new Date().getTime();
    var image = (await ProductDAO.selectByID(req.session.productId)).image;
    if (req.file)
        image = req.file.buffer.toString('base64');
    if (!image.toString().startsWith('data:image/png;base64,'))
        image = 'data:image/png;base64,' + image;
    var products = { _id: req.session.productId, name: name, price: price, amount: amount, category: category, image: image, creationDate: time, zone: zone };
    var result = await ProductDAO.update(products);
    if (result) {
        resp.redirect('/admin/listproducts');
        delete req.session.productId;
    } else {
        resp.redirect(`/admin/editproduct/${req.session.productId}`);
    }
});

router.get('/productdetail/:id', async (req, resp) => {

    var product = await ProductDAO.selectByID(req.params.id);
    var isExisted = await isExistedInOrders(req.params.id);
    resp.render('admin/productdetail', { product: product, canBeDelete: !isExisted });
});

router.get('/editproduct/:id', async (req, resp) => {
    var list = await CategoryDAO.selectAll2();
    var zones = await ZoneDAO.selectAll();
    var _id = req.params.id;
    req.session.productId = _id;
    var product = await ProductDAO.selectByID(_id);
    resp.render('admin/editproduct', { product: product, categories: list, Zones: zones });
});

router.get('/listzones', async (req, resp) => {
    var list = await ZoneDAO.selectAll();
    resp.render('../views/admin/listzones.ejs', { zones: list });
});

router.post('/addzone', async (req, resp) => {
    var name = req.body.name;
    var zone = { name: name };
    var result = await ZoneDAO.insert(zone);
    if (result) {
        MyUtil.showAlertAndRedirect(resp, 'Adding zone successfully!', './listzones');
    } else {
        MyUtil.showAlertAndRedirect(resp, 'Adding zone failed', './listzones');
    }
});

router.post('/updatezone', async (req, resp) => {
    var _id = req.body.id;
    var name = req.body.nameZone;
    var zone = { _id: _id, name: name };
    var result = await ZoneDAO.update(zone);
    if (result) {
        MyUtil.showAlertAndRedirect(resp, 'Updating zone successfully!', './listzones');
    } else {
        MyUtil.showAlertAndRedirect(resp, 'Updating zone failed', './listzones');
    }
});

router.post('/deletezone', async (req, resp) => {
    var _id = req.body.txtID;
    var result = await ZoneDAO.delete(_id);
    if (result) {
        MyUtil.showAlertAndRedirect(resp, 'Deleting zone successfully!', './listzones');
    } else {
        MyUtil.showAlertAndRedirect(resp, 'Deleting zone failed', './listzones');
    }
});

router.get('/deleteproduct', async (req, res) => {
    var id = req.query.id;
    var result = await ProductDAO.delete(id);
    res.send({ success: result.toString() });
});

async function isExistedInOrders(id) {
    var result = await OrderDAO.selectByProdID(id);

    return result.length !== 0;
}

module.exports = router;