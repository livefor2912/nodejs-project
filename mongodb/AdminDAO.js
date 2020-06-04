var client = require("../../utils/MongodbUtil.js");
var AdminDAO = {
  async selectByUsernameAndPassword(username, password) {
    var query = { username: username, password: password };
    var db = await client.getDB();
    var admin = await db.collection("admins").findOne(query);
    return admin;
  }
};
module.exports = AdminDAO;