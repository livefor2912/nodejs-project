//CLI: npm install mongoose --save
var mongoose = require('mongoose');
var MyConstants = require('./MyConstants.js');
var uri = "mongodb+srv://" + MyConstants.DB_USER + ":" + MyConstants.DB_PASS + "@" + MyConstants.DB_SERVER + "/" + MyConstants.DB_DATABASE;
mongoose.connect(uri, { useNewUrlParser: true }, function (err) {
  if (err) throw err;
  console.log("Connected to " + MyConstants.DB_SERVER + "/" + MyConstants.DB_DATABASE);
});