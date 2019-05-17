var socket = io();

socket.on('message', function(data) {
    console.log(data);
});

var movement = {
        up: false,
        down: false,
        left: false,
        right: false
    }

document.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
      case 65: // A
        movement.left = true;
        break;
      case 87: // W
        movement.up = true;
        break;
      case 68: // D
        movement.right = true;
        break;
      case 83: // S
        movement.down = true;
        break;
    }
});
document.addEventListener('keyup', function(event) {
    switch (event.keyCode) {
    case 65: // A
        movement.left = false;
        break;
    case 87: // W
        movement.up = false;
        break;
    case 68: // D
        movement.right = false;
        break;
    case 83: // S
        movement.down = false;
        break;
    }
});

socket.emit('new player');
  
setInterval(function() {
    socket.emit('movement', movement);
}, 1000 / 60);

function placeDiv(tmp) {
  var d = document.createElement('div');
  d.className = "playerDIV";
  d.style.position = "absolute";
  d.style.left = tmp.x+'px';
  d.style.top = tmp.y+'px';
  d.style.background.opacity = 0;
  // d.style.border = "solid #000000"
  d.innerText = ' ' + tmp.username.charAt(0);
  d.style.color = "#ffffff"
  document.body.appendChild(d);
}

var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var ctx = canvas.getContext('2d');
socket.on('state', function(players) {
  [...document.getElementsByClassName('playerDIV')].map(n => n && n.remove());
  ctx.clearRect(0, 0, 800, 600);
  for (var player1 in players) {
    var tmp = players[player1];
    placeDiv(tmp);
    ctx.beginPath();
    if (tmp.tag){
      ctx.fillStyle = 'red';
    }
    else{
      ctx.fillStyle = tmp.color;
    }
    ctx.fillRect(tmp.x-tmp.width/2,tmp.y-tmp.height/2,tmp.width,tmp.height);
    ctx.closePath();
  }
});
