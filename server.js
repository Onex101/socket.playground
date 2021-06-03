// Dependencies
var express = require("express");
var http = require("http");
var path = require("path");
var socketIO = require('socket.io', { rememberTransport: false, transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling'] });
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var querystring = require("querystring");
var username = "";

app.use("/static", express.static(__dirname + "/static"));
// Routing
app.get("/", function(request, response) {
    response.sendFile(path.join(__dirname, "index.html"));
});
// app.post("/", function(request, response) {
//     var body = "";
//     let data;
//     request.on("data", (chunk) => {
//         body += chunk;
//     });
//     request.on("end", () => {
//         const data = querystring.parse(body);
//         username = data.username;
//     });
//     response.sendFile(path.join(__dirname, "index.html"), data);
// });
// Starts the server.
server.listen(process.env.PORT || 5000, function() {
    console.log(`Starting server on port ${process.env.PORT || 5000}`);
});
var player_speed = 5;
var player_size = 20;
var vel_increment = 0.5;
var canvas_height = 600;
var canvas_width = 800;

//Declare list of players connected
var players = [];

io.sockets.on('connection', function(socket) {
    var socket_id = socket.id;
    var player_index, player_exists = false;
    var this_player;

    var check_bounds = function() {
        //Keep player in the canvas
        if (this_player.y < 0)
            this_player.y = 0;
        if (this_player.y + player_size > canvas_height)
            this_player.y = canvas_height - player_size;

        if (this_player.x < 0)
            this_player.x = 0;
        if (this_player.x + player_size > canvas_width)
            this_player.x = canvas_width - player_size;

        //Keep velocity between -5 and 5
        if (this_player.vely > player_speed)
            this_player.vely = player_speed;
        if (this_player.velx > player_speed)
            this_player.velx = player_speed;

        if (this_player.vely < -player_speed)
            this_player.vely = -player_speed;
        if (this_player.velx < -player_speed)
            this_player.velx = -player_speed;
    };

    const testCollisionRectRect = function(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect2.x < rect1.x + rect1.width &&
            rect1.y < rect2.y + rect2.height &&
            rect2.y < rect1.y + rect1.height
        );
    };

    const testCollision = function(player2) {
        //return if colliding (true/false)
        const entity2 = players[player2]
        const rect1 = {
            x: this_player.x - this_player.width / 2,
            y: this_player.y - this_player.height / 2,
            width: this_player.width,
            height: this_player.height,
        };
        const rect2 = {
            x: entity2.x - entity2.width / 2,
            y: entity2.y - entity2.height / 2,
            width: entity2.width,
            height: entity2.height,
        };
        // console.log({ rect1, rect2 })
        if (testCollisionRectRect(rect1, rect2) && this_player.is_it) {
            this_player.is_it = false;
            players[player2].is_it = true;

        }
    }

    var sv_update = function() {
        if (player_exists)
            for (var player2 in players) {
                if (this_player.id !== players[player2].id) {
                    testCollision(player2);
                }
            }
        io.sockets.emit('sv_update', players);
        if (player_exists) {
            if (players.length == 1)
                this_player.is_it = true;
            check_bounds();
        }
    };

    //When a client connects, add them to players[]
    //Then update all clients
    socket.on('init_client', function(player) {
        player.id = socket.id;
        players.push(player);

        for (var i = 0; i < players.length; i++)
            if (players[i].id == socket_id)
                player_index = i;
        player_exists = true;
        this_player = players[player_index];

        sv_update();
        socket.emit('load_players', players);

        // console.log(players);
    });

    //====================CHAT==========================//
    var address = socket.request.connection.remoteAddress;

    socket.on('new user', function(data, callback) {
        console.log(player_exists)
        if (player_exists) {
            this_player.name = data;
            console.log(address + " has connected as '" + data + "'.");
            callback();
        }
    });

    socket.on('error', function(error) {
        console.log(error)
    })

    socket.on('Connect_failed', function(error) {
        console.log(error)
    })

    socket.on('send message', function(data) {
        io.sockets.emit('broadcast', this_player.name, data);
    });
    //====================CHAT==========================//

    //if player is_it and is within another player, hitting 'j' will make the other player is_it. 

    //Gather key input from users...
    socket.on('up', function() {
        if (player_exists) {
            this_player.y -= player_speed;
            sv_update();
        }
    });

    //Gather key input from users...
    socket.on('down', function() {
        if (player_exists) {
            this_player.y += player_speed;
            sv_update();
        }
    });

    //Gather key input from users...
    socket.on('left', function() {
        if (player_exists) {
            this_player.x -= player_speed;

            sv_update();
        }
    });

    //Gather key input from users...
    socket.on('right', function() {
        if (player_exists) {
            this_player.x += player_speed;

            sv_update();
        }
    });

    //When a player disconnects, remove them from players[]
    //Then update all clients
    socket.on('disconnect', function() {
        for (var i = 0; i < players.length; i++) {
            if (players[i].id == socket.id) {
                players.splice(i, 1);
            }
        }

        sv_update();
    });
});