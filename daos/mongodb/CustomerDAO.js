var client = require("../../utils/MongodbUtil.js");
var ObjectId = require('mongodb').ObjectId;
var CustomerDAO = {
  async selectAll() {
    var query = {};
    var db = await client.getDB();
    var customers = await db.collection("customers").find(query).toArray();
    return customers;
  },
  async selectByID(_id) {
    var query = { _id: ObjectId(_id) };
    var db = await client.getDB();
    var customer = await db.collection("customers").findOne(query);
    return customer;
  },
  async selectByUsernameAndPassword(username, password) {
    var query = { username: username, password: password };
    var db = await client.getDB();
    var customer = await db.collection("customers").findOne(query);
    return customer;
  },
  async selectByUsernameOrEmail(username, email) {
    var query = { $or: [{ username: username }, { email: email }] };
    var db = await client.getDB();
    var customer = await db.collection("customers").findOne(query);
    return customer;
  },
  async insert(customer) {
    var db = await client.getDB();
    var result = await db.collection("customers").insertOne(customer);
    return result.insertedCount > 0 ? result.insertedId : null;
  },
  async update(customer) {
    var query = { _id: ObjectId(customer._id) };
    var newvalues = { $set: { username: customer.username, password: customer.password, name: customer.name, phone: customer.phone, email: customer.email } };
    var db = await client.getDB();
    var result = await db.collection("customers").updateOne(query, newvalues);
    return result.result.nModified > 0 ? true : false;
  },
  async active(_id, token, active) {
    var query = { _id: ObjectId(_id), token: token };
    var newvalues = { $set: { active: active } };
    var db = await client.getDB();
    var result = await db.collection("customers").updateOne(query, newvalues);
    return result.result.nModified > 0 ? true : false;
  }
};
module.exports = CustomerDAO;