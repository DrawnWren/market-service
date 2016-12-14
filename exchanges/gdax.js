const WebSocket = require('ws');
const get = require('../util/rest').get;


function establish(pair) {
  const wsURI = 'wss://ws-feed.gdax.com';
  let ws = new WebSocket(wsURI);
  const pairs = Array.isArray(pair) ? pair : [pair];

  ws.results = {
    activity: [],
  };

  ws.clearResults = () => {
    Object.keys(ws.results).forEach((k) => {
      ws.results[k] = [];
      return true;
    });
  };

  ws.on('open', () => {
    ws.send(
      JSON.stringify({
        type: 'subscribe',
        product_ids: pairs,
      }));
  });

  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    msg.proTime = new Date().getTime();
    ws.results.activity.push(msg);
  });

  ws.on('close', () => {
    console.log('GDAX web socket closed.');
    ws = establish(pair);
  });

  return ws;
}

function snapshot(pair) {
  const orderBookURI = `https://api.gdax.com/products/${pair}/book?level=3`;
  return get(`${orderBookURI}`);
}

function gdax(pair, time, callback) => {
  const connection = establish(pair);
  // get a snapshot at the beginning of the window
  let orderBookSnapshot = snapshot(pair);
  orderBookSnapshot.reqTime = new Date().getTime();
  setInterval(() => {
    const results = connection.results;
    orderBookSnapshot
      .then((s) => {
        results.orderBookSnapshot = s.body;
        callback(results);

        // take a snapshot of the orderbook for the next window
        orderBookSnapshot = snapshot(pair);
        connection.clearResults();
      });
  }, time);
};

module.exports = gdax;
