var socket = io();

socket.on("message", function (data) {
	console.log(data);
});

var movement = {
	up: false,
	down: false,
	left: false,
	right: false,
};

window.addEventListener("keydown", function (event) {
	event.stopPropagation();
	// event.defaultPrevented()
	switch (event.key) {
		case "a": // A
			movement.left = true;
			break;
		case "w": // W
			movement.up = true;
			break;
		case "d": // D
			movement.right = true;
			break;
		case "s": // S
			movement.down = true;
			break;
	}
});
window.addEventListener("keyup", function (event) {
	switch (event.key) {
		case "a": // A
			movement.left = false;
			break;
		case "w": // W
			movement.up = false;
			break;
		case "d": // D
			movement.right = false;
			break;
		case "s": // S
			movement.down = false;
			break;
	}
});

socket.emit("new player");

setInterval(function () {
	socket.emit("movement", movement);
}, 1000 / 60);

function placeDiv(tmp) {
	var d = document.createElement("div");
	var span = document.createElement("span");
	var userName = document.createTextNode(tmp.username);
	span.style.color = "black";
	span.style.position = "relative";
	span.style.top = "-12px";

	d.className = "playerDIV";
	// d.style.position = "absolute";
	// d.style.left = tmp.x + "px";
	// d.style.top = tmp.y + "px";
	// d.style.background.opacity = 0;
	d.style.overflow = "visible";
	// d.style.border = "solid #000000"
	// d.innerText = " " + tmp.username.charAt(0);
	span.appendChild(userName);
	d.appendChild(userName);
	d.style.color = "#ffffff";
	document.body.appendChild(d);
}

var canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 600;
var ctx = canvas.getContext("2d");
socket.on("state", function (players) {
	[...document.getElementsByClassName("playerDIV")].map(
		(n) => n && n.remove()
	);
	ctx.clearRect(0, 0, 800, 600);
	for (var player1 in players) {
		var tmp = players[player1];
		placeDiv(tmp);
		ctx.beginPath();
		if (tmp.tag) {
			ctx.fillStyle = "red";
		} else {
			ctx.fillStyle = tmp.color;
		}
		ctx.fillRect(
			tmp.x - tmp.width / 2,
			tmp.y - tmp.height / 2,
			tmp.width,
			tmp.height
		);
		ctx.fillStyle = "black";
		ctx.textAlign = "center";
		ctx.fillText(
			tmp.username,
			tmp.x - tmp.width / 2,
			tmp.y - tmp.height / 1.5
		);
		ctx.closePath();
	}
});
