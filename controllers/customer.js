var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var uri = 'mongodb+srv://admin:tYFofQJbk98w31OR@cluster0-baxfc.mongodb.net/project';

router.get('/', (req, resp) => {
    resp.render('../views/customer/home.ejs');
});


router.get('/login', (req, resp) => {
    if(req.session.cus) {
        resp.redirect('home');
    } else {
        resp.render('../views/customer/login.ejs');
    }
});

router.post('/login', async (req, resp) => {
    var username = req.body.username;
    var password = req.body.password;
    var pwdhashed = MyUtil.md5(password);
    var cus = await AdminDAO.selectByUsernameAndPassword(username, pwdhashed);
    if (cus) {
      req.session.cus = cus;
      resp.redirect('home');
    } else {
      MyUtil.showAlertAndRedirect(resp, 'Invalid login!', './login');
    }
});





module.exports = router;