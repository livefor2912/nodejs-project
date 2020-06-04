require('../../utils/MongooseUtil.js');
var Models = require('../../models/Models.js');
var ProductDAO = {
  async selectAll() {
    var query = {};
    var products = await Models.Product.find(query).exec();
    return products;
  },
  async selectByID(_id) {
    var product = await Models.Product.findById(_id).exec();
    return product;
  },
  async selectByCatID(_cid) {
    var query = { 'category._id': _cid };
    var products = await Models.Product.find(query).exec();
    return products;
  },
  async selectByKeyword(keyword) {
    var query = { name: { $regex: new RegExp(keyword, "i") } };
    var products = await Models.Product.find(query).exec();
    return products;
  },
  async selectTopNew(top) {
    var query = {};
    var mysort = { cdate: -1 }; // descending
    var products = await Models.Product.find(query).sort(mysort).limit(top).exec();
    return products;
  },
  async selectTopHot(top) {
    var items = await Models.Order.aggregate([
      { $match: { status: 'APPROVED' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product._id', sum: { $sum: '$items.quantity' } } },
      { $sort: { sum: -1 } }, // descending
      { $limit: top }
    ]).exec();
    //console.log(items); // for DBUG
    var products = [];
    for (var item of items) {
      var product = await ProductDAO.selectByID(item._id);
      products.push(product);
    }
    return products;
  },
  async insert(product) {
    var mongoose = require('mongoose');
    product._id = new mongoose.Types.ObjectId();
    var result = await Models.Product.create(product);
    return result ? true : false;
  },
  async update(product) {
    var newvalues = { name: product.name, price: product.price, image: product.image, category: product.category };
    var result = await Models.Product.findByIdAndUpdate(product._id, newvalues);
    return result ? true : false;
  },
  async delete(_id) {
    var result = await Models.Product.findByIdAndRemove(_id);
    return result ? true : false;
  }
};
module.exports = ProductDAO;