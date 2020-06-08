var client = require("../../utils/MongodbUtil.js");
var ObjectId = require('mongodb').ObjectId;
var ZoneDAO = {
  async selectAll() {
    var query = {};
    var db = await client.getDB();
    var zones = await db.collection("zones").find(query).toArray();
    return zones;
  },
  async selectAll2() {
    var query = {};
    var db = await client.getDB();
    var zones = await db.collection("zones").find(query).toArray();
    return zones;
  },
  async selectByID(_id) {
    var query = { _id: ObjectId(_id) };
    var db = await client.getDB();
    var zone = await db.collection("zones").findOne(query);
    return zone;
  },
  async insert(zone) {
    var db = await client.getDB();
    var result = await db.collection("zones").insertOne(zone);
    return result.insertedCount > 0 ? true : false;
  },
  async update(zone) {
    var query = { _id: ObjectId(zone._id) };
    var newvalues = { $set: { name: zone.name } };
    var db = await client.getDB();
    var result = await db.collection("zones").updateOne(query, newvalues);
    return result.result.nModified > 0 ? true : false;
  },
  async delete(_id) {
    var query = { _id: ObjectId(_id) };
    var db = await client.getDB();
    var result = await db.collection("zones").deleteOne(query);
    return result.result.n > 0 ? true : false;
  }
};
module.exports = ZoneDAO;