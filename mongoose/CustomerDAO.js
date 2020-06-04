require('../../utils/MongooseUtil.js');
var Models = require('../../models/Models.js');
var CustomerDAO = {
  async selectAll() {
    var query = {};
    var customers = await Models.Customer.find(query).exec();
    return customers;
  },
  async selectByID(_id) {
    var customer = await Models.Customer.findById(_id).exec();
    return customer;
  },
  async selectByUsernameAndPassword(username, password) {
    var query = { username: username, password: password };
    var customer = await Models.Customer.findOne(query);
    return customer;
  },
  async selectByUsernameOrEmail(username, email) {
    var query = { $or: [{ username: username }, { email: email }] };
    var customer = await Models.Customer.findOne(query);
    return customer;
  },
  async insert(customer) {
    var mongoose = require('mongoose');
    customer._id = new mongoose.Types.ObjectId();
    var result = await Models.Customer.create(customer);
    return result ? result._id : null;
  },
  async update(customer) {
    var newvalues = { username: customer.username, password: customer.password, name: customer.name, phone: customer.phone, email: customer.email };
    var result = await Models.Customer.findByIdAndUpdate(customer._id, newvalues);
    return result ? true : false;
  },
  async active(_id, token, active) {
    var query = { _id: _id, token: token };
    var newvalues = { active: active };
    var result = await Models.Customer.findOneAndUpdate(query, newvalues);
    return result ? true : false;
  }
};
module.exports = CustomerDAO;