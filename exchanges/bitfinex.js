const BitfinexWS = require('bitfinex-api-node').WS;

function bitfinex(pair, time, callback) {
  const bws = new BitfinexWS();
  let trades = [];
  let books = [];

  bws.on('open', () => {
    bws.subscribeTrades(pair);
    bws.subscribeOrderBook(pair);
  });

  bws.on('trade', (_, trade) => {
    const proTime = new Date().getTime();
    trades.push({ trade, proTime });
  });

  bws.on('orderbook', (_, book) => {
    const proTime = new Date().getTime();
    books.push({ book, proTime });
  });

  bws.on('error', console.error);

  bws.on('close', () => {
    console.log('Bitfinex websocket closed.');
    bitfinex(pair, time, callback);
  });

  setInterval(() => {
    callback({ books, trades }, pair);
    books = [];
    trades = [];
  }, time);
}


module.exports = bitfinex;
