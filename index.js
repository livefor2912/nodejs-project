var express = require('express');
var app = express();
app.listen(process.env.PORT || 1234);
// app.listen(1234);

//middleware
app.use(express.static('public')); //say that all file in public is static, dont compile
app.use('/public', express.static('public'));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

//init some var to provide cookie and session storage
//MemoryStore = express.session.MemoryStore
//var sessionStore = new MemoryStore();

var session = require('express-session');
app.use(session({
    secret: '123456',
    //name: cookie_name,
    //store: sessionStore,
    proxy: true,
    resave: true,
    saveUninitialized: true
}));
app.use((req, resp, next) => {
    resp.locals.session = req.session;
    next();
});

//template engine
app.set('view engine', 'ejs');

//controllers
app.use('/admin', require('./controllers/admin.js'));
app.use('/', require('./controllers/customer.js'));