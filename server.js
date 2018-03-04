const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const WebSocket = require('ws');
const Camera = require('./camera');
const env = require('./env.json');
const camera = new Camera({verbose: true, hflip: false, vflip: false});

const port = process.env.PORT || 5000;

const password = env.password;
const camSocket = env.camSocket;

app.use('/', express.static(path.join(__dirname, 'rpiImages')));

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
            } );
        } else {
            io.sockets.connected[socket.id].emit('wrong-password');
        }
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

const mpegStream = camera.stream('mpeg', mpegSocket.broadcast);

mpegSocket.on('connection', client => {
    console.log('WebSocket Connection', mpegSocket.clients.size);
    if (1 === mpegSocket.clients.size) {
        mpegStream.start();
        console.log('Open MPEG Stream');
    }
    client
        .on('close', () => {
            if (0 === mpegSocket.clients.size) {
                mpegStream.stop();
                console.log('Close MPEG Stream');
            }
        });
});


http.listen(port, () => console.log(`Listening on port ${port}`));