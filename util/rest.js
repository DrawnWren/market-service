const request = require('request');

module.exports.get = url => new Promise((fulfill, reject) => {
  request({
    uri: url,
    headers: {
      'User-Agent': 'btcpie',
    },
  }, (err, res) => {
    if (err) reject(err);
    else fulfill(res);
  });
});

