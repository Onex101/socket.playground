var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var path = require("path");

app.use(express.static(__dirname + "/node_modules"));
app.use("/public", express.static(path.join(__dirname, "public")));
app.get("/", function (req, res, next) {
	res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", function (client) {
	console.log("Client connected...");
	client.on("join", function (data) {
		console.log(data);
	});
});

server.listen(5000);
