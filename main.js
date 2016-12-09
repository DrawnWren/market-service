const bitmex = require('./exchanges/bitmex');
const bitfinex = require('./exchanges/bitfinex');
const poloniex = require('./exchanges/poloniex');
const gdax = require('./exchanges/gdax');

const upload = require('./util/upload');

const pair = {
  bitfinex: 'BTCUSD',
  bitmex: 'XBT',
  poloniex: 'USDT_BTC',
  gdax: 'BTC-USD',
};

const time = 3600000;

bitmex(pair.bitmex, time, results => upload(results, pair.bitmex, 'bitmex'));

bitfinex(
  pair.bitfinex,
  time,
  results => upload(results, pair.bitfinex, 'bitfinex')
);

poloniex(
  pair.poloniex,
  time,
  results => upload(results, pair.poloniex, 'poloniex')
);

gdax(
  pair.gdax,
  time,
  results => upload(results, pair.gdax, 'gdax')
);
