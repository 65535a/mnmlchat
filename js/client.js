$(document).ready(function(){
	var socket = io();
	var $setNick = $('#setNick');
	var $nickError = $('#nickError');
	var $nickBox = $('#nickname');
	var $users = $('#users');
	var $rooms = $('#roomsList');
	var $roomBox = $('#room');
	var room = "lobby";


	socket.on('connected', function(){
		$('#enterNick').animation('flipIn');		
		console.log('connected');
	});
	
	$('#setNick').submit(function(e){
		e.preventDefault();
		socket.emit('new user', $nickBox.val(), function(data){
			if(data){
				$('#enterNick').animation('flipOut');
				$nickError.html('');
			} else {
				$('#enterNick').animation('shake');
				$nickError.html('UNACCEPTABLE!');
			}	
		});
		$nickBox.val('');
	});
	
	$('#addRoom').submit(function(e){
		e.preventDefault();
		var newRoom = $roomBox.val();
		socket.emit('add room', $roomBox.val(), function(data) {
			if(data){
				socket.emit('leave room', room, function(data) {
					if(data){
						socket.emit('join room', newRoom);
						room = newRoom;
						console.log(room);
					} 
				});
			} else { $('#addRoom').animation('shake') }		
		});
		$('#messages').empty();
		$roomBox.val('');
		$('#m').focus();
	});

	$('#chat').submit(function(e){
		e.preventDefault();
		var msg =  $('#m').val();		
		socket.emit('chat message', msg, room, function(data) {
			if(data){
				receipt = msg.substr(3);	
				var ind = receipt.indexOf(' ');
				if(ind !== -1){
					var name = receipt.substr(0, ind);
					var receipt = receipt.substr(ind + 1);
					$('#messages').append($('<li>').html('<i>' + '---> ' + name + " : " + receipt + '</i>'));
				}
			}
		});
		$('#m').val('');
	});
	
	$('#rooms').on('click', '.roomLink', function(){
		var current = this;
		var newRoom = '';
	 	newRoom = current.textContent;		
		if(newRoom !== room){	
			socket.emit('leave room', room, function(data) {
				if(data){
					socket.emit('join room', newRoom);
					room = newRoom;
					console.log(room);
				}
			});
			$('#messages').empty();
			$('#m').focus();
		}
	});

	$('#users').on('click', '.userLink' ,function(){
		var pMsgTo = this.textContent;
		$('#m').val('/w ' + pMsgTo + ' ');
		$('#m').focus();
	});
	
	socket.on('chat message', function(nickname, msg){
		$('#messages').append($('<li>').html('<b>' + nickname + " : " + '</b>' + msg));
		$('#chatWindow').animate({scrollTop: $('#chatWindow')[0].scrollHeight}, 2000);
	});
	
	socket.on('private message', function(nickname, msg){
		$('#messages').append($('<li>').html('<b>' + '<i>' + nickname + " : " + '</b>' + msg + '</i>'));
		$('#chatWindow').animate({scrollTop: $('#chatWindow')[0].scrollHeight}, 2000);
	});
		
	socket.on('users', function(data){
		var html = '';
		for (i=0; i < data.length; i++){
			html += '<div class="userLink">' + data[i] + '</div>';
			console.log(data[i]);
		}
		$users.html(html);
	});
	
	socket.on('rooms', function(data){
		var html = '';
		for (i=0; i < data.length; i++){
			if(data[i] !== room){
				html += '<div class="roomLink">' + data[i] + '</div>';
			}else {
				html += '<div class="roomLink">' + '<b>' + data[i] + '</b>' + '</div>';
				}
		}
		$rooms.html(html);
	});
});