var client = require("../../utils/MongodbUtil.js");
var ObjectId = require('mongodb').ObjectId;
var CategoryDAO = {
  async selectAll() {
    var query = {};
    var db = await client.getDB();
    var categories = await db.collection("categories").find(query).toArray();
    return categories;
  },
  async selectByID(_id) {
    var query = { _id: ObjectId(_id) };
    var db = await client.getDB();
    var category = await db.collection("categories").findOne(query);
    return category;
  },
  async insert(category) {
    var db = await client.getDB();
    var result = await db.collection("categories").insertOne(category);
    return result.insertedCount > 0 ? true : false;
  },
  async update(category) {
    var query = { _id: ObjectId(category._id) };
    var newvalues = { $set: { name: category.name } };
    var db = await client.getDB();
    var result = await db.collection("categories").updateOne(query, newvalues);
    return result.result.nModified > 0 ? true : false;
  },
  async delete(_id) {
    var query = { _id: ObjectId(_id) };
    var db = await client.getDB();
    var result = await db.collection("categories").deleteOne(query);
    return result.result.n > 0 ? true : false;
  }
};
module.exports = CategoryDAO;