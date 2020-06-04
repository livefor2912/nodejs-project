//CLI: npm install mongodb --save
var MongoClient = require('mongodb').MongoClient;
var MyConstants = require('./MyConstants.js');
// singleton
var db = null;
var getDB = async () => {
  if (db) return db;
  var uri = "mongodb+srv://" + MyConstants.DB_USER + ":" + MyConstants.DB_PASS + "@" + MyConstants.DB_SERVER + "/" + MyConstants.DB_DATABASE;
  var conn = await MongoClient.connect(uri, { useNewUrlParser: true });
  db = conn.db(MyConstants.DB_DATABASE);
  return db;
};
module.exports = { getDB: getDB };