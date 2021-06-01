let socket = io.connect({ transports: ["websocket"], upgrade: false });
console.log(socket);

socket.on("connect_error", (err) => {
	console.log(`connect_error due to ${err.message}`);
});
window.onload = () => {
	var form = document.getElementById("form");
	var input = document.getElementById("input");
	form.addEventListener("submit", function (e) {
		e.preventDefault();
		if (socket.connected && input.value) {
			console.log(input.value, "client");
			socket.emit("chat message", input.value);
			input.value = "";
		}
	});
};

// const newUserConnected = (user) => {
// 	userName = user || `User${Math.floor(Math.random() * 1000000)}`;
// 	socket.emit("new user", userName);
// };

// newUserConnected();

// socket.on("new user", function (data) {
// 	console.log("new user:", data);
// });

// socket.on("user disconnected", function (userName) {
// 	document.querySelector(`.${userName}-userlist`).remove();
// });
