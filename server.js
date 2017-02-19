var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/css', express.static(__dirname + '/node_modules/kube-css/css'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/js', express.static(__dirname + '/js'));

var nickMaxLength = 15;
var roomMaxLength = 15;
var users = {};
var rooms = {
	lobby : new Array()
};

app.get('/', function(req, res){
	res.sendfile('index.html');
});

io.set('heartbeat timeout', 50000);
io.set('heartbeat interval', 2000);

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(){
		if(!socket.nickname) return;
		clearUser(socket.nickname, socket.room);
		delete users[socket.nickname];
		console.log('a user disconnected');
	});	


	socket.on('chat message', function(msg, room, callback){
		if(msg.length > 0 && msg.substr(0, 3) === '/w ') {
			msg = msg.substr(3);
			var ind = msg.indexOf(' ');
			if(ind !== -1){
				var name = msg.substr(0, ind);
				var msg = msg.substr(ind + 1);				
				if (name in users){
					users[name].emit('private message', socket.nickname, msg);
					callback(true);
				}
			}
		} else if(msg.length > 0){
			io.sockets.in(room).emit('chat message', socket.nickname, msg);
			console.log(room + " : " + socket.nickname + ' : ' + msg );
			}
	});		
	
	socket.on('new user', function(data, callback){
		if(data in users || data.length > nickMaxLength) {
			callback(false);
		} else {
			callback(true);
			socket.nickname = data.replace(/ /g,'');
			socket.room = 'lobby'
			users[socket.nickname] = socket;
			users[socket.room] = 'lobby';
			socket.join('lobby');
			rooms['lobby'].push(socket.nickname);
			updateNicknames('lobby');
			updateRooms();
		}
	});
	
	socket.on('add room', function(data, callback){
		if(data.length < roomMaxLength){
			room = data;
			rooms[room] = socket.room;
			rooms[room] = new Array();
			console.log(socket.nickname + ' created room : ' + room);
			callback(true);
		} else { callback(false) };
	});
	
	socket.on('join room', function(room){
		socket.join(room);
		if(rooms[room] !== undefined) {
			rooms[room].push(socket.nickname);
			users[socket.room] = room;
			socket.room = room;
		}
		updateRooms();
		updateNicknames(room)
		console.log(socket.nickname + ' joined the room : ' + room);
	});
	
	socket.on('leave room', function(room, callback){
		if(room === socket.room){
			console.log(room);
			console.log(socket.room);
			callback(true);
			socket.leave(room);
			removeFromRoom(rooms[room], socket.nickname);
			console.log(socket.nickname + ' left the room : ' + room);
			destroyRoom(room);
			updateNicknames(room);
		} else { callback(false) }
	});
		
	function clearUser(user, room){
		removeFromRoom(rooms[room], socket.nickname);
		destroyRoom(socket.room);
		updateNicknames(socket.room);
		updateRooms();
	}

});



function updateNicknames(room){
	if(rooms[room] !== undefined) {
		var people = rooms[room].slice();
		io.sockets.in(room).emit('users', people);
	}
} 

function updateRooms(){
	io.sockets.emit('rooms', Object.keys(rooms));
	 console.log(rooms);
}

function removeFromRoom(room){
    var what, a = arguments, L = a.length, ax;
    if(room !== undefined) {
    	while (L > 1 && room.length) {
       	 what = a[--L];
       	 while ((ax= room.indexOf(what)) !== -1) {
       	     room.splice(ax, 1);
       	 }
    	}
    }
    return room;
}

function destroyRoom(room){
	if(rooms[room] !== undefined) {
		if(rooms[room].length === 0 && room !== 'lobby'){
			delete rooms[room];
			console.log('room ' + room + ' destroyed!');
		}
	}
}



http.listen(process.env.PORT || 3000, function(){
	console.log('listening on *:3000');
});