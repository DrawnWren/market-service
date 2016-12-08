const autobahn = require('autobahn');
const upload = require('../util/upload');
const get = require('../util/rest').get;

const wsURI = 'wss://api.poloniex.com';
const restURI = 'https://poloniex.com/public?command=returnOrderBook&currencyPair='

const connection = new autobahn.Connection({
  url: wsURI,
  realm: "realm1"
});



function log(results) {
  console.log(`orderBook ${results.orderBook.orders.length}, activity ${results.activity.length}
  time ${results.orderBook.resTime - results.orderBook.reqTime}`);
}

function toS3 (results, pair) {
  return upload(results, pair, 'poloniex');
}


// close over pair and time so open can be reused
function open (connection, pair, time, depth, callback) {
  connection.pair = pair;
  connection.time = time;
  connection.depth = depth;
  connection.callback = callback;

  connection.onopen = function (session) {

    let activity = []; 

    console.log(pair, time);

    function marketEvent (args,kwargs) {
      let act = {};
      act.actions = args;
      act.proTime = new Date().getTime();
      activity.push(act);
    }

    setInterval(() => {
      // try with no depth parameter set
      const reqTime = new Date().getTime();
      get(`${restURI}${pair}&depth=${depth}`)
      .then(res => {
        const resTime = new Date().getTime();
        const orderBook = {orders: res.body, resTime, reqTime };
        callback({ orderBook, activity }, pair);
        activity = [];
      })
      .catch( err => console.log(err) );
    }, time);

    
    session.subscribe(pair, marketEvent);
  }

  connection.open();
}

connection.onclose = function () {
  console.log("Websocket connection closed");
  open(this, this.pair, this.time, this.depth, this.callback);
}

open(connection, 'USDT_BTC', 3600000, 1000, toS3);

