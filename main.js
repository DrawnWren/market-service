const bitmex = require('./exchanges/bitmex');
const bitfinex = require('./exchanges/bitfinex');
const upload = require('./util/upload');

const pair = {
  bitfinex: 'BTCUSD',
  bitmex: 'XBT'
};

let time = 3600000;

bitmex(pair.bitmex, time, results => upload(results, pair.bitmex, 'bitmex'));

bitfinex(
  pair.bitfinex, 
  time, 
  results => upload(results, pair.bitfinex, 'bitfinex')
);
