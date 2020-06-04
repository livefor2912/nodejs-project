require('../../utils/MongooseUtil.js');
var Models = require('../../models/Models.js');
var OrderDAO = {
  async selectAll() {
    var query = {};
    var mysort = { cdate: -1 }; // descending
    var orders = await Models.Order.find(query).sort(mysort).exec();
    return orders;
  },
  async selectByID(_id) {
    var order = await Models.Order.findById(_id).exec();
    return order;
  },
  async selectByCustID(_cid) {
    var query = { 'customer._id': _cid };
    var orders = await Models.Order.find(query).exec();
    return orders;
  },
  async selectByProdID(_pid) {
    var query = { 'items.product._id': _pid };
    var orders = await Models.Order.find(query).exec();
    return orders;
  },
  async insert(order) {
    var mongoose = require('mongoose');
    order._id = new mongoose.Types.ObjectId();
    var result = await Models.Order.create(order);
    return result ? true : false;
  },
  async update(_id, newStatus) {
    var newvalues = { status: newStatus };
    var result = await Models.Order.findByIdAndUpdate(_id, newvalues);
    return result ? true : false;
  }
};
module.exports = OrderDAO;