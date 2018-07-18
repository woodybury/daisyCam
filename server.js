const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const os = require('os');
const fs = require('fs');
const path = require("path");

where = os.type();
let mac = false;
if (where === 'Darwin') {
    mac = true;
}

const env = require('./env.json');
const spawn = require('child_process').spawn;
const util = require("util");

let tensorflow = null;
let stream = null;

const port = process.env.PORT || 5000;

const password = env.password;
const camSocket = env.camSocket;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static(path.join(__dirname, 'client/build')));

app.use('/api/images/files', express.static(path.join(__dirname, 'tensorflow/daisy_detection/capture/daisy')));

app.get('/api/images', (req, res, next) => {
  let images = [];
  fs.readdirSync('tensorflow/daisy_detection/capture/daisy').forEach(file => {
    if (file.includes(".jpg")) {
      images.push(file);
    }
  });
  res.send(images);
  next()
});


let sockets = {};

io.on('connection', (socket) => {

    sockets[socket.id] = socket;

    io.sockets.emit( 'watch', Object.keys(sockets).length );

    if (Object.keys(sockets).length === 1) {

        if (tensorflow !== null) {
            tensorflow.kill();
        }

        if (!mac) {
            setTimeout(() => {
                stream = spawn('node',["stream.js"]);
                util.log('readingin');

                stream.stderr.on('data', (chunk) => {
                  let textChunk = chunk.toString('utf8');
                  util.log(textChunk);
                });

                stream.stdout.on('data', (chunk) => {
                  let textChunk = chunk.toString('utf8');
                  util.log(textChunk);
                });

            }, 1000);
        }
    }

    socket.on( 'chatText', ( chatText ) => {
        io.sockets.emit ( 'chatMsg', {
            chatText: chatText,
            id: socket.id
        } );
    });

    socket.on('disconnect', () => {
        delete sockets[socket.id];
        io.sockets.emit( 'watch', Object.keys(sockets).length );

        if (Object.keys(sockets).length === 0) {
            if (!mac) {
              stream.kill();
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

            }, 1000);

        }
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
        //
    });

    socket.on("error", (err) => {
        console.log(err);
    });

});

http.listen(port, () => console.log(`Listening on port ${port}`));