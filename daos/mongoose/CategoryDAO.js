require('../../utils/MongooseUtil.js');
var Models = require('../../models/Models.js');
var CategoryDAO = {
  async selectAll() {
    var query = {};
    var categories = await Models.Category.find(query).exec();
    return categories;
  },
  async selectByID(_id) {
    var category = await Models.Category.findById(_id).exec();
    return category;
  },
  async insert(category) {
    var mongoose = require('mongoose');
    category._id = new mongoose.Types.ObjectId();
    var result = await Models.Category.create(category);
    return result ? true : false;
  },
  async update(category) {
    var newvalues = { name: category.name }
    var result = await Models.Category.findByIdAndUpdate(category._id, newvalues);
    return result ? true : false;
  },
  async delete(_id) {
    var result = await Models.Category.findByIdAndRemove(_id);
    return result ? true : false;
  }
};
module.exports = CategoryDAO;