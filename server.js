// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var querystring = require('querystring');
var username = "";

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'login.html'));
});
app.post('/', function(request, response){
	var body = "";
	request.on("data", (chunk) => {
		body += chunk;
	});
	request.on("end", () => {
		const data = querystring.parse(body);
		username = data.username;
	});
	response.sendFile(path.join(__dirname, 'index.html'));
});
// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

var SOCKET_LIST = {};
var PLAYER_LIST = {};
var WIDTH = 800;
var HEIGHT = 600;

Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
			if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};

Player = function(username, socketID, tag){	
	var self = Actor('player','myId',50,40,30,5,20,20,'green',10,1);
	self.movement = {};
	self.username = username;
	self.socketID = socketID;
	self.tag = tag;
	self.previousTag;
	console.log(self);

	self.updatePosition = function(){

			if(self.movement.right)
				self.x += 5;
			if(self.movement.left)
				self.x -= 5;
			if(self.movement.down)
				self.y += 5;
			if(self.movement.up)
				self.y -= 5;
			
			if(self.x < self.width/2)
				self.x = self.width/2;
			if(self.x > WIDTH - self.width/2)
				self.x = WIDTH - self.width/2;
			if(self.y < self.height/2)
				self.y = self.height/2;
			if (self.y > HEIGHT - self.height/2)
				self.y = HEIGHT - self.height/2;
	}
	return self;
}

Actor = function(type,id,x,y,spdX,spdY,width,height,color,hp,atkSpd){
		var self = Entity(type,id,x,y,spdX,spdY,width,height,color);

		self.hp = hp;
		self.atkSpd = atkSpd;
		self.attackCounter = 0;
		self.aimAngle = 0;
			
		var super_update = self.update;
		self.update  = function(){
			super_update();
			self.attackCounter += self.atkSpd;
		}
			
		self.performAttack = function(){
			if(self.attackCounter > 25){
				self.attackCounter = 0;
			// generateBullet(self);
		}

	}

	self.performSpecialAttack = function(){
			if(self.attackCounter > 50){
				self.attackCounter = 0;
					// generateBullet(self, self.aimAngle - 5);
					// generateBullet(self, self.aimAngle);
					// generateBullet(self, self.aimAngle + 5);
		}
	}
	return self		
}

Entity = function(type,id,x,y,spdX,spdY,width,height,color){
		var self = {
				type:type,
				x:x,
				spdX:spdX,
				y:y,
				spdY:spdY,
				id:id,
				width:width,
				height:height,
				color:color,
		};
		self.update = function (){
				self.updatePosition();
		}

		self.getDistance = function (entity2){ //return distance (number). This function runs after other functions run becasue it isnt calle upon right away
				var vx = self.x - entity2.x;
				var vy = self.y - entity2.y;
				return Math.sqrt(vx*vx+vy*vy);
		}

		self.testCollision = function(player2){ //return if colliding (true/false)
			entity2 = PLAYER_LIST[player2]
			var rect1 = {
						x:self.x-self.width/2,
						y:self.y-self.height/2,
						width:self.width,
						height:self.height,
				}
				var rect2 = {
						x:entity2.x-entity2.width/2,
						y:entity2.y-entity2.height/2,
						width:entity2.width,
						height:entity2.height,
				}
				if (testCollisionRectRect(rect1, rect2)){
					if (self.movement.right){
						self.x -= 5;
						entity2.x += 5;
					}
					if (self.movement.left){
						self.x -= -5;
						entity2.x += -5;
					}
					if (self.movement.up){
						self.y -= -5;
						entity2.y += -5;
					}
					if (self.movement.down){
						self.y -= 5;
						entity2.y += 5;
					}
					if (self.tag && player2 != self.previousTag){ // If I collide into someone
						self.tag = false;
						entity2.tag = true;
						entity2.previousTag = self.socketID;
					}
				}
		}	
		self.updatePosition = function(){
			self.x += self.spdX;
			self.y += self.spdY;
			
			if(self.x < 0 || self.x > WIDTH){
				self.spdX = -self.spdX;
			}	
			if(self.y < 0 || self.y > HEIGHT){
				self.spdY = -self.spdY;
			}
		}
		return self;
}	

testCollisionRectRect = function(rect1,rect2){
	return (rect1.x < rect2.x + rect2.width
			&&  rect2.x < rect1.x + rect1.width
			&&  rect1.y < rect2.y + rect2.height
			&&  rect2.y < rect1.y + rect1.height)
}

var io = require('socket.io')(server,{});
io.sockets.on('connection',function(socket){

    console.log("Player " + socket.id + " connected with username - " + username);
		var player;
		if (Object.size(PLAYER_LIST) <= 0){
			player = Player(username, socket.id, true);
		}
		else
			player = Player(username, socket.id, false);
		PLAYER_LIST[socket.id] = player;
	
    socket.on('disconnect',function(){
      console.log("Player " + socket.id + " disconnected");
      delete PLAYER_LIST[socket.id];
      delete SOCKET_LIST[socket.id];
    });
	
    socket.on('movement', function(movement){
			player = PLAYER_LIST[socket.id];
			player.movement = movement;
			player.update();
			for (var player2 in PLAYER_LIST){
				if (socket.id != player2){
					player.testCollision(player2);
				}
			}
		});

    setInterval(function() {
      //console.log(PLAYER_LIST);
      socket.emit('state', PLAYER_LIST);
    }, 1000 / 60);
});