const WebSocket = require('ws');
const Camera = require('./camera');
const camera = new Camera({verbose: true, hflip: false, vflip: false});

const mpegSocket = new WebSocket.Server({ port: 5001 });

mpegSocket.broadcast = data => {
  mpegSocket
    .clients
    .forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
};

const mpegStream = camera.stream('mpeg', mpegSocket.broadcast);

mpegSocket.on('connection', client => {
  console.log('WebSocket Connection', mpegSocket.clients.size);
  if (1 === mpegSocket.clients.size) {
    setTimeout(() => { mpegStream.start(); }, 500);
    console.log('Open MPEG Stream');
  }
  client
    .on('close', () => {
      console.log('WebSocket closed, now:', mpegSocket.clients.size);
      if (0 === mpegSocket.clients.size) {
        mpegStream.stop();
        console.log('Close MPEG Stream');
      }
    });
  client
    .on('error', (err) => {
      console.log (err);
    });
});