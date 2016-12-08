const BitfinexWS = require('bitfinex-api-node').WS;
const upload = require('../util/upload');

function toS3(results, pair) {
  return upload(results, pair, 'bitfinex');
}

function doit (pair, time, callback) {
  const bws = new BitfinexWS();
  let trades = [];
  let books = [];

  bws.on('open', () => {
    bws.subscribeTrades(pair);
    bws.subscribeOrderBook(pair);
  });
  
  bws.on('trade', (pair, trade) => {
    const proTime = new Date().getTime();
    trades.push({ trade, proTime });
  });

  bws.on('orderbook', (pair, book) => {
    const proTime = new Date().getTime();
    books.push({ book, proTime });
  });
  
  bws.on('error', console.error);

  setInterval(() => {
    callback({ books, trades }, pair);
  }, time);
};

doit('BTCUSD', 3600000, toS3);
