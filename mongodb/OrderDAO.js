var client = require("../../utils/MongodbUtil.js");
var ObjectId = require('mongodb').ObjectId;
var OrderDAO = {
  async selectAll() {
    var query = {};
    var mysort = { cdate: -1 }; // descending
    var db = await client.getDB();
    var orders = await db.collection("orders").find(query).sort(mysort).toArray();
    return orders;
  },
  async selectByID(_id) {
    var query = { _id: ObjectId(_id) };
    var db = await client.getDB();
    var order = await db.collection("orders").findOne(query);
    return order;
  },
  async selectByCustID(_cid) {
    var query = { 'customer._id': ObjectId(_cid) };
    var db = await client.getDB();
    var orders = await db.collection("orders").find(query).toArray();
    return orders;
  },
  async selectByProdID(_pid) {
    var query = { 'items.product._id': ObjectId(_pid) };
    var db = await client.getDB();
    var orders = await db.collection("orders").find(query).toArray();
    return orders;
  },
  async insert(order) {
    // wrap in ObjectId
    order.customer._id = ObjectId(order.customer._id);
    for (var item of order.items) {
      item.product._id = ObjectId(item.product._id);
      item.product.category._id = ObjectId(item.product.category._id);
    }
    var db = await client.getDB();
    var result = await db.collection("orders").insertOne(order);
    return result.insertedCount > 0 ? true : false;
  },
  async update(_id, newStatus) {
    var query = { _id: ObjectId(_id) };
    var newvalues = { $set: { status: newStatus } };
    var db = await client.getDB();
    var result = await db.collection("orders").updateOne(query, newvalues);
    return result.result.nModified > 0 ? true : false;
  }
};
module.exports = OrderDAO;