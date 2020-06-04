//CLI: npm install crypto --save
var MyUtil = {
  showAlertAndRedirect(response, msg, url) {
    var script = "<script type='text/javascript'>";
    script += "alert('" + msg + "');";
    script += "location='" + url + "';";
    script += "</script>";
    response.send(script);
  },
  getTotal(mycart) {
    var total = 0;
    for (var item of mycart) {
      total += item.product.price * item.quantity;
    }
    return total;
  },
  md5(input) {
    var crypto = require('crypto');
    var hash = crypto.createHash('md5').update(input).digest('hex');
    return hash;
  }
};
module.exports = MyUtil;