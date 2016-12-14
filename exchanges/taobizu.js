const get = require('../util/rest').get;

const baseURI = 'http://taobizu.com/trade/chart_json/market/';

function taobizu(pair, time, callback) {
  let responses = [];
  setInterval(() => {
    const uri = `${baseURI}${pair}`;
    return get(uri)
    .then((response) => {
      const proTime = new Date().getTime();
      responses.push({ proTime, response });
    })
    .catch(e => console.error(e));
  }, 1000);
  setInterval(() => {
    callback({ responses });
    responses = [];
  }, time);
}

module.exports = taobizu;
