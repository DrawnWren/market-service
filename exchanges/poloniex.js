const autobahn = require('autobahn');
const get = require('../util/rest').get;

const wsURI = 'wss://api.poloniex.com';
const restURI = 'https://poloniex.com/public?command=returnOrderBook&currencyPair=';

/*
function log(results) {
  console.log(`orderBook ${results.orderBook.orders.length}, activity ${results.activity.length}
  time ${results.orderBook.resTime - results.orderBook.reqTime}`);
};
*/
function getOrders(pair, depth) {
  return get(`${restURI}${pair}&depth=${depth}`);
}

// close over pair and time so open can be reused
function poloniex(pair, time, callback) {
  const ws = new autobahn.Connection({
    url: wsURI,
    realm: 'realm1',
  });

  ws.pair = pair;
  ws.time = time;
  ws.depth = 1000;
  ws.callback = callback;

  ws.onopen = function (session) {
    let activity = [];

    function marketEvent(args) {
      const act = {};
      act.actions = args;
      act.proTime = new Date().getTime();
      activity.push(act);
    }

    let reqTime = new Date().getTime();
    let orders = getOrders(ws.pair, ws.depth);

    setInterval(() => {
      // try with no depth parameter set
      orders
        .then((res) => {
          const resTime = new Date().getTime();
          const orderBook = { orders: res.body, resTime, reqTime };
          callback({ orderBook, activity }, pair);
          orders = getOrders(ws.pair, ws.depth);
          reqTime = new Date().getTime();
          activity = [];
        })
      .catch(err => console.log(err));
    }, time);

    session.subscribe(pair, marketEvent);
  };

  ws.onclose = function () {
    console.log('Poloniex websocket connection closed');
    poloniex(ws.pair, ws.time, ws.callback);
  };

  ws.open();
}

module.exports = poloniex;
