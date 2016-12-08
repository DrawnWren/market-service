const request = require('request');

module.exports.get = (url) => {
  return new Promise(function(fulfill, reject) {
    request(url, function(err, res) {
      if(err) reject(err);
      else fulfill(res);
    });
  });
}
