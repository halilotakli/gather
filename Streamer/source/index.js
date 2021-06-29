var port = 8002;
const { Socket } = require('dgram');
var express = require('express');
var app = express();
var server = require('http').Server(app);
const io = require('socket.io')(server);
io.on('connection', (client) => {
    try {
        console.log("connected");
        client.on("disconnect", () => {
            console.log("disconnected");
        });

        client.on("joinRoom", (data) => {
            try {
                client.join(data);
                io.sockets.emit("joinedPerson", data);
                console.log("joined" + data);
            } catch (r) {
                console.log(r);
            }
        });

        client.on("leaveRoom", (data) => {
            try {
                client.leave(data);
                io.sockets.emit("leavedPerson", data);
                console.log("leaved" + data);
            } catch (r) {
                console.log(r);
            }
        });

        client.on("sendVideo", (data) => {
            try {
                io.sockets.emit(data.room + "comingvideo", data.meta);
            } catch (rr) {
                console.log(rr);
            }
        });

        client.on("sendSound", (data) => {
            try {
                io.sockets.in("sound").emit("comingsound", data);
            } catch (rr) {
                console.log(rr);
            }
        });
        console.log("connected");
    } catch (rrr) {
        console.log(rrr);
    }
});
app.use(express.static('public'))
app.get('/', function (request, response) {
    console.log(__dirname);
    response.sendFile(__dirname + '/view/index.html');
});
console.info(port + " Portu Dinleniyor.");
server.listen(port);