const BitfinexWS = require('bitfinex-api-node').WS;

module.exports = (pair, time, callback) => {
  const bws = new BitfinexWS();
  let trades, books = [];

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
    callback({ books, trades });
  }, time);
};
