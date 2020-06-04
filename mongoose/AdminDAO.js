require('../../utils/MongooseUtil.js');
var Models = require('../../models/Models.js');
var AdminDAO = {
  async selectByUsernameAndPassword(username, password) {
    var query = { username: username, password: password };
    var admin = await Models.Admin.findOne(query);
    return admin;
  }
};
module.exports = AdminDAO;