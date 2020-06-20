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

//============== product management ================

router.get("/listproducts", async (req, resp) => {
    var list = await ProductDAO.selectAll();
    resp.render('../views/admin/listproducts', { listProduct: list });
});


router.get('/productdetail', async (req, resp) => {
    var product = await ProductDAO.selectByID(req.query.id);
    var isExisted = await isExistedInOrders(req.query.id);
    resp.render('../views/admin/productdetail', { product: product, canBeDelete: !isExisted });
});


router.get("/addproduct", async (req, resp) => {
    var list = await CategoryDAO.selectAll2();
    var zones = await ZoneDAO.selectAll();
    resp.render('../views/admin/addproduct', { categories: list, Zones: zones });
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


router.get('/updateproduct', async (req, resp) => {
    var list = await CategoryDAO.selectAll2();
    var zones = await ZoneDAO.selectAll();
    var _id = req.query.id;
    req.session.productId = _id;
    var product = await ProductDAO.selectByID(_id);
    resp.render('../views/admin/updateproduct', { product: product, categories: list, Zones: zones });
});

router.post('/updateproduct', upload.single('image'), async (req, resp) => {
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
        // resp.redirect('/admin/listproducts');
        MyUtil.showAlertAndRedirect(resp, "Update product successfully", '/admin/listproducts');
        delete req.session.productId;
    } else {
        MyUtil.showAlertAndRedirect(resp, 'Update product failed', `/admin/updateproduct/${req.session.productId}`);
        // resp.redirect(`/admin/updateproduct/${req.session.productId}`);
    }
});


router.get('/deleteproduct', async (req, res) => {
    var id = req.query.id;
    var result = await ProductDAO.delete(id);
    res.send({ success: result.toString() });
});

//============== category management ================

router.get('/listcate', async function (req, res) {
    var categories = await CategoryDAO.selectAll();
    res.render('../views/admin/listcate.ejs', { cats: categories });
});

router.post('/addcate', async function (req, res) {
    var name = req.body.name;
    var category = { name: name };
    var result = await CategoryDAO.insert(category);
    if (result) {
        MyUtil.showAlertAndRedirect(res, 'Add category successfully!', './listcate');
    } else {
        MyUtil.showAlertAndRedirect(res, 'Add category failed', './listcate');
    }
});

router.post('/updatecate', async function (req, res) {
    var _id = req.body.id;
    var name = req.body.name;
    var category = { _id: _id, name: name };
    var result = await CategoryDAO.update(category);
    if (result) {
        MyUtil.showAlertAndRedirect(res, 'Update category successfully!!', './listcate');
    } else {
        MyUtil.showAlertAndRedirect(res, 'Update category failed', './listcate');
    }
});

router.post('/deletecate', async function (req, res) {
    var _id = req.body.id;
    var result = await CategoryDAO.delete(_id);
    if (result) {
        MyUtil.showAlertAndRedirect(res, 'Delete category successfully!', './listcate');
    } else {
        MyUtil.showAlertAndRedirect(res, 'Delete category failed', './listcate');
    }
});

//============== zone management ================

router.get('/listzones', async (req, resp) => {
    var list = await ZoneDAO.selectAll();
    resp.render('../views/admin/listzones.ejs', { zones: list });
});

router.post('/addzone', upload.single('fileImage'), async (req, resp) => {
    var name = req.body.name;
    if(req.file) {
        var image = req.file.buffer.toString('base64');
        var zone = { name: name, image: 'data:image/png;base64,'+image };
        var result = await ZoneDAO.insert(zone);
        if (result)
            MyUtil.showAlertAndRedirect(resp, 'Adding zone successfully!', './listzones');
    }
    else MyUtil.showAlertAndRedirect(resp, 'Adding zone failed', './listzones');
});

router.post('/updatezone', upload.single('fileImage'), async (req, resp) => {
    var _id = req.body.id;
    var name = req.body.nameZone;
    var image = (await ZoneDAO.selectByID(_id)).image;
    if (req.file)
        image = req.file.buffer.toString('base64');
    if (!image.toString().startsWith('data:image/png;base64,'))
        image = 'data:image/png;base64,' + image;
    var zone = { _id: _id, name: name, image: image };
    var result = await ZoneDAO.update(zone);
    if (result)
        MyUtil.showAlertAndRedirect(resp, 'Updating zone successfully!', './listzones');
    else
        MyUtil.showAlertAndRedirect(resp, 'Updating zone failed', './listzones');
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

//============== order management ================

router.get('/listorders', async function (req, resp) {
    if(req.session.admin) {
    var orders = await OrderDAO.selectAll();
    var _id = req.query.id; // /listorder?id=XXX
    if (_id) {
      var order = await OrderDAO.selectByID(_id);
    }
    resp.render('../views/admin/listorders.ejs', { orders: orders, order: order });
    }else {
        resp.redirect('login');
    }
});
router.get('/updatestatus', async function (req, res) {
    var _id = req.query.id; // /updatestatus?status=XXX&id=XXX
    var newStatus = req.query.status;
    await OrderDAO.update(_id, newStatus);
    res.redirect('./listorders?id=' + _id);
  });

async function isExistedInOrders(id) {
    var result = await OrderDAO.selectByProdID(id);

    return result.length !== 0;
}

module.exports = router;