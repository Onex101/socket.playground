const socket = io.connect();

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;

document.body.appendChild(canvas);

var player = {
    id: '',
    name: '',
    is_it: false,
    x: canvas.width / 2,
    y: canvas.height / 2,
    velx: 0,
    vely: 0
};

var client_player_list = [];
socket.on('load_players', function(players) {
    client_player_list = players;
});

var keysDown = {};

addEventListener('keydown', function(e) {
    keysDown[e.keyCode] = true;
}, false);

addEventListener('keyup', function(e) {
    delete keysDown[e.keyCode];
}, false);

//take input from keys and send input to server
var update = function() {
    if (87 in keysDown)
        socket.emit('up');
    if (83 in keysDown) //player holding s
        socket.emit('down');
    if (65 in keysDown) //player holding a
        socket.emit('left');
    if (68 in keysDown) //player holding d
        socket.emit('right');
    if (74 in keysDown)
        socket.emit('tag');
};

//render all players, update players when server updates
var render = function() {
    //ctx.clearColor = "rgba(0, 0, 0, .3)";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#079641";
    ctx.textAlign = 'center';

    for (var i = 0; i < client_player_list.length; i++) {
        if (client_player_list[i].is_it)
            ctx.fillStyle = "#8F0E0E";
        else
            ctx.fillStyle = "#079641";

        ctx.fillRect(client_player_list[i].x, client_player_list[i].y, 25, 25);

        ctx.fillStyle = "#FFF";
        ctx.font = "15px Arial";
        ctx.fillText('asdwaw', client_player_list[i].x + 8, client_player_list[i].y - 3);
    }
};

socket.on('sv_update', function(players) {
    client_player_list = players;
});

socket.on('error', (error) => console.log(error))
socket.on('connect_failed', function() {
        console.log("Sorry, there seems to be an issue with the connection!");
    })
    //main loop
var main = function() {
    setInterval(function() {
        update();
        render();
    }, 1000 / 60);
};

socket.emit('init_client', {...player, name: 'Xeno' })

main()