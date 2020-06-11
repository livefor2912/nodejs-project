var client = require("../../utils/MongodbUtil.js");
var ObjectId = require('mongodb').ObjectId;
var ProductDAO = {
  async selectAll() {
    var query = {};
    var db = await client.getDB();
    var products = await db.collection("products").find(query).toArray();
    return products;
  },
  async selectTest() {
    var db = await client.getDB();
    var products = await db.collection('products').aggregate([{
      $lookup: {
        from: 'categories',
        localField: 'idcategory',
        foreignField: '_id',
        as: 'category'
      }
    }, {$unwind: '$category'}, {
      $lookup: {
        from: 'zones',
        localField: 'idzone',
        foreignField: '_id',
        as: 'zone'
      }
    }, {$unwind: '$zone'}, {$project: {idcategory: 0, idzone: 0}}]).toArray();
    return products;
  },
  async selectByID(_id) {
    var query = { _id: ObjectId(_id) };
    var db = await client.getDB();
    var product = await db.collection("products").findOne(query);
    return product;
  },
  async selectByCatID(_cid) {
    var query = { 'category._id': ObjectId(_cid) };
    var db = await client.getDB();
    var products = await db.collection("products").find(query).toArray();
    return products;
  },
  async selectByID2(_id) {
    var query = { _id: ObjectId(_id) };
    var db = await client.getDB();
    var product = await db.collection('products').aggregate([{
      $lookup: {
        from: 'categories',
        localField: 'idcategory',
        foreignField: '_id',
        as: 'category'
      }
    }, {$unwind: '$category'}, {
      $lookup: {
        from: 'zones',
        localField: 'idzone',
        foreignField: '_id',
        as: 'zone'
      }
    }, {$unwind: '$zone'}, {$project: {idcategory: 0, idzone: 0}}]).toArray().findOne(query);
    return product;
  },
  async selectByKeyword(keyword) {
    var query = { name: { $regex: new RegExp(keyword, "i") } };
    var db = await client.getDB();
    var products = await db.collection("products").find(query).toArray();
    return products;
  },
  async selectTopNew(top) {
    var query = {};
    var mysort = { cdate: -1 }; // descending
    var db = await client.getDB();
    var products = await db.collection("products").find(query).sort(mysort).limit(top).toArray();
    return products;
  },
  async selectTopHot(top) {
    var db = await client.getDB();
    var items = await db.collection("orders").aggregate([
      { $match: { status: 'APPROVED' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product._id', sum: { $sum: '$items.quantity' } } },
      { $sort: { sum: -1 } }, // descending
      { $limit: top }
    ]).toArray();
    //console.log(items); // for DBUG
    var products = [];
    for (var item of items) {
      var product = await ProductDAO.selectByID(item._id);
      products.push(product);
    }
    return products;
  },
  async insert(product) {
    var db = await client.getDB();
    var result = await db.collection("products").insertOne(product);
    return result.insertedCount > 0 ? true : false;
  },
  async update(product) {
    var query = { _id: ObjectId(product._id) };
    var newvalues = { $set: { name: product.name, price: product.price, image: product.image, idcategory: product.idcategory, idzone: product.idzone } };
    var db = await client.getDB();
    var result = await db.collection("products").updateOne(query, newvalues);
    return result.result.nModified > 0 ? true : false;
  },
  async delete(_id) {
    var query = { _id: ObjectId(_id) };
    var db = await client.getDB();
    var result = await db.collection("products").deleteOne(query);
    return result.result.n > 0 ? true : false;
  }
};
module.exports = ProductDAO;