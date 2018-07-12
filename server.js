const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const WebSocket = require('ws');
const os = require('os');

where = os.type();
let mac = false;
if (where === 'Darwin') {
    mac = true;
}

if ( ! mac ) {
    const Camera = require('./camera');
    const camera = new Camera({verbose: true, hflip: false, vflip: false});
}

const env = require('./env.json');
const spawn = require('child_process').spawn;
const util = require("util");


let tensorflow = null;

setTimeout(() => {
  tensorflow = spawn('python3',["tensorflow/daisy_detection/daisy_detection_main.py"]);
  util.log('readingin');

  tensorflow.stderr.on('data', (chunk) => {
    let textChunk = chunk.toString('utf8');
    util.log(textChunk);
  });

  tensorflow.stdout.on('data', (chunk) => {
    let textChunk = chunk.toString('utf8');
    util.log(textChunk);
  });

}, 5000);

const port = process.env.PORT || 5000;

const password = env.password;
const camSocket = env.camSocket;

app.use('/', express.static(path.join(__dirname, 'tensorflow/daisy_detection/capture/daisy')));

let sockets = {};

io.on('connection', (socket) => {

    sockets[socket.id] = socket;

    io.sockets.emit( 'watch', Object.keys(sockets).length );

    socket.on( 'chatText', ( chatText ) => {
        io.sockets.emit ( 'chatMsg', {
            chatText: chatText,
            id: socket.id
        } );
    });

    socket.on('disconnect', () => {
        delete sockets[socket.id];
        io.sockets.emit( 'watch', Object.keys(sockets).length );
    });

    socket.on('start-stream', ( pwd ) => {
        if (pwd === password ) {
            io.sockets.connected[socket.id].emit('liveStream', {
                camSocket: camSocket,
                id: socket.id
            });
        } else {
            io.sockets.connected[socket.id].emit('wrong-password');
        }
    });

    socket.on('take-photo', () => {
        if ( ! mac ) {
            mpegStream.stop();

            let args = ["-w", "640", "-h", "480", "-o", "./rpiImages/daisy.jpg" + Math.random(), "-t", "999999999", "-tl", "100"];
            setTimeout(() => {
                let picture = spawn('raspistill', args);
                util.log('readingin');

                picture.stderr.on('data', (chunk) => {
                  let textChunk = chunk.toString('utf8');
                  util.log(textChunk);
                });

                picture.stdout.on('data', (chunk) => {
                  let textChunk = chunk.toString('utf8');
                  util.log(textChunk);
                });

            }, 5000);
        }
    });

    socket.on("error", (err) => {
        console.log(err);
    });

});

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

if ( ! mac ) {
  const mpegStream = camera.stream('mpeg', mpegSocket.broadcast);
}

mpegSocket.on('connection', client => {
    console.log('WebSocket Connection', mpegSocket.clients.size);
    if (1 === mpegSocket.clients.size) {
        if ( ! mac ) {
            if (tensorflow !== null) {
                tensorflow.stdin.pause();
                tensorflow.kill();
            }
            setTimeout(() => { mpegStream.start(); }, 5000);
        }
        console.log('Open MPEG Stream');
    }
    client
        .on('close', () => {
            console.log('WebSocket closed, now:', mpegSocket.clients.size);
            if (0 === mpegSocket.clients.size) {
                if ( ! mac ) {
                    mpegStream.stop();
                }
                setTimeout(() => {
                    tensorflow = spawn('python3',["tensorflow/daisy_detection/daisy_detection_main.py"]);
                    util.log('readingin');

                    tensorflow.stderr.on('data', (chunk) => {
                      let textChunk = chunk.toString('utf8');
                      util.log(textChunk);
                    });

                    tensorflow.stdout.on('data', (chunk) => {
                      let textChunk = chunk.toString('utf8');
                      util.log(textChunk);
                    });

                }, 5000);
                console.log('Close MPEG Stream');
            }
        });
    client
        .on('error', (err) => {
            console.log (err);
        });
});


http.listen(port, () => console.log(`Listening on port ${port}`));