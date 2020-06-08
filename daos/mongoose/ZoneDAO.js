require('../../utils/MongooseUtil.js');
var Models = require('../../models/Models.js');
var ZoneDAO = {
  async selectAll() {
    var query = {};
    var zones = await Models.Zone.find(query).exec();
    return zones;
  },
  async selectByID(_id) {
    var zone = await Models.Zone.findById(_id).exec();
    return zone;
  },
  async insert(zone) {
    var mongoose = require('mongoose');
    zone._id = new mongoose.Types.ObjectId();
    var result = await Models.Zone.create(category);
    return result ? true : false;
  },
  async update(zone) {
    var newvalues = { name: zone.name }
    var result = await Models.Zone.findByIdAndUpdate(zone._id, newvalues);
    return result ? true : false;
  },
  async delete(_id) {
    var result = await Models.Zone.findByIdAndRemove(_id);
    return result ? true : false;
  }
};
module.exports = ZoneDAO;