const autobahn = require('autobahn');
const request = require('request');

const wsURI = 'wss://api.poloniex.com';
const restURI = 'https://poloniex.com/public?command=returnOrderBook&currencyPair='

const connection = new autobahn.Connection({
  url: wsURI,
  realm: "realm1"
});

function get (url) {
  return new Promise(function(fulfill, reject) {
    request(url, function(err, res) {
      if(err) reject(err);
      else fulfill(res);
    });
  });
}

function process(results) {
  console.log(`orderBook ${results.orderBook.orders.length}, activity ${results.activity.length}
  time ${results.orderBook.resTime - results.orderBook.reqTime}`);
}

// close over pair and time so open can be reused
function open (connection, pair, time, depth) {

  connection.onopen = function (session) {

    let activity = []; 

    console.log(pair, time);

    function marketEvent (args,kwargs) {
      args.proTime = new Date().getTime();
      activity.push(args);
    }

    setInterval(() => {
      // try with no depth parameter set
      const reqTime = new Date().getTime();
      get(`${restURI}${pair}&depth=${depth}`)
      .then(res => {
        const resTime = new Date().getTime();
        const orderBook = {orders: res.body, resTime, reqTime };
        process({ orderBook, activity });
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
}
		       
open(connection, 'USDT_BTC', 60000, 10000);

