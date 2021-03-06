const WebSocket = require('ws');

const uri = 'wss://www.bitmex.com/realtime';

function establish(subscriptions) {
  let ws = new WebSocket(uri);

  ws.results = {
    orderBookL2s: [],
    orderBook10s: [],
    trades: [],
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
        op: 'subscribe',
        args: subscriptions,
      })
    );
  });

  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    msg.proTime = new Date().getTime();
    if (ws.results[`${msg.table}s`] === undefined) {
      console.log('BITMEX: Unlogged message ', msg);
    }
    if (msg.table) ws.results[`${msg.table}s`].push(msg);
  });

  ws.on('close', () => {
    console.log('Bitmex websocket closed.');
    ws = establish(subscriptions);
  });

  return ws;
}

function bitmex(pair, time, callback) {
  const subscriptions = [
    `orderBook10:${pair}`,
    `orderBookL2:${pair}`,
    `trade:${pair}`,
  ];

  const connection = establish(subscriptions);

  setInterval(() => {
    callback(connection.results);
    connection.clearResults();
  }, time);
}

module.exports = bitmex;
