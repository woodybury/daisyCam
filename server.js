const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const os = require('os');

where = os.type();
let mac = false;
if (where === 'Darwin') {
    mac = true;
}

const env = require('./env.json');
const spawn = require('child_process').spawn;
const util = require("util");


let tensorflow, stream = null;

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

}, 3000);

const port = process.env.PORT || 5000;

const password = env.password;
const camSocket = env.camSocket;


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

        stream.kill()
    });

    socket.on('start-stream', ( pwd ) => {
        if (pwd === password ) {
            io.sockets.connected[socket.id].emit('liveStream', {
                camSocket: camSocket,
                id: socket.id
            });

            tensorflow.kill();

            setTimeout(() => {
                stream = spawn('node',["stream.js"]);
                util.log('readingin');

                tensorflow.stderr.on('data', (chunk) => {
                  let textChunk = chunk.toString('utf8');
                  util.log(textChunk);
                });

                tensorflow.stdout.on('data', (chunk) => {
                  let textChunk = chunk.toString('utf8');
                  util.log(textChunk);
                });

            }, 3000);

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