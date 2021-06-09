const socket = io.connect();

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

const wrapper = document.getElementById("canvas-wrapper");

wrapper.appendChild(canvas);

var player = {
    id: '',
    name: '',
    is_it: false,
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 25,
    height: 25,
    velx: 0,
    vely: 0
};

var client_player_list = [];
socket.on('load_players', function(players) {
    client_player_list = players;
});

var keysDown = {};

addEventListener('keydown', function(e) {
    keysDown[e.key] = true;
}, false);

addEventListener('keyup', function(e) {
    delete keysDown[e.key];
}, false);

function submitUsername(event) {
    let username = document.getElementById("username").value;
    socket.emit('init_client', {...player, name: username })
    form.style.display = 'none';
    event.preventDefault();
}

const form = document.getElementById('form');
const log = document.getElementById('log');
form.addEventListener('submit', submitUsername);


//take input from keys and send input to server
var update = function() {
    if ('w' in keysDown)
        socket.emit('up');
    if ('s' in keysDown) //player holding s
        socket.emit('down');
    if ('a' in keysDown) //player holding a
        socket.emit('left');
    if ('d' in keysDown) //player holding d
        socket.emit('right');
};

var frequency = 200;

//render all players, update players when server updates
var render = function() {
    //ctx.clearColor = "rgba(0, 0, 0, .3)";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#079641";
    ctx.textAlign = 'center';
    ctx.strokeStyle = "red";

    for (var i = 0; i < client_player_list.length; i++) {
        ctx.save();
        const player = client_player_list[i];
        if (player.is_it) {
            if (Math.floor(Date.now() / frequency) % 2) {
                ctx.lineWidth = 5;
                ctx.lineJoin = 'round';
                ctx.strokeRect(player.x, player.y, 25,25);
                ctx.shadowBlur = 15;
                ctx.shadowColor = "red";
            } else {
                ctx.shadowBlur = 0;
            }
            ctx.fillStyle = "red";
        } 
        else
            ctx.fillStyle = "green";

        ctx.fillRect(player.x, player.y, 25, 25);

        ctx.fillStyle = "black";
        ctx.font = "15px Arial";
        ctx.fillText(player.name, player.x + 8, player.y - 3);
        ctx.restore();
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


main()