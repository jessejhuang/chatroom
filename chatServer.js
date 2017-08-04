var http = require("http"),
socketio = require("socket.io"),
url = require('url'),
path = require('path'),
mime = require('mime'),
fs = require("fs");

//Listen for http connections. This is essentially a miniature static file server that only
//serves one file, client.html
var app = http.createServer(function(req,resp){
	//This callback runs when a new connection is made to our http server.
	var filename = path.join(__dirname, ".", url.parse(req.url).pathname);
	(fs.exists || path.exists)(filename, function(exists){
		if (exists) {
			fs.readFile(filename, function(err, data){
				if (err) {
					// File exists but is not readable (permissions issue?)
					resp.writeHead(500, {
						"Content-Type": "text/plain"
					});
					resp.write("Internal server error: could not read file");
					resp.end();
					return;
				}
				
				// File exists and is readable
				var mimetype = mime.lookup(filename);
				resp.writeHead(200, {
					"Content-Type": mimetype
				});
				resp.write(data);
				resp.end();
				return;
			});
		}else{
			// File does not exist
			resp.writeHead(404, {
				"Content-Type": "text/plain"
			});
			resp.write("404: Requested file not found: "+filename);
			resp.end();
			return;
		}
	});
});
app.listen(3456);


function ChatRoom(name,password,creator){
	this.name = name;
	this.password = password;
	this.creator = creator; //Set to current user
	this.banned_users = [];
	this.users_in_room=[];
}

//usernames in chat
var usernames = [];
var currentUser;
var lobby = new ChatRoom("Lobby","","SYSTEM");
var chatRoomNames = [];
chatRoomNames.push("Lobby");
var chatRooms = [];
chatRooms.push(lobby);
//Chatroom object with owner



// Do the Socket.IO magic:
var io = socketio.listen(app);
io.sockets.on("connection", function(socket){
	console.log("An anonymous user has connected.");
	socket.currentUser = "Anonymous";
	//socket.currentRoom = "Lobby";
	socket.join("Lobby");
	chatRooms.forEach(function(room){
		io.sockets.emit("update_client_rooms",{NewRoom: room.name,
			Password: room.password});
	});
	// This callback runs when a new Socket.IO connection is established.
	
	//Switching rooms from: http://stackoverflow.com/questions/19156636/node-js-and-socket-io-creating-room
	socket.on("room_to_server",function(data){
		socket.leave(socket.currentRoom);
		socket.broadcast.to(socket.currentRoom).emit('message_to_client',  {username: "SYSTEM",
																			message: socket.currentUser +' has left this room'});

		chatRooms.forEach(function(room){
			if(room.name === socket.currentRoom){
				//Taken from http://stackoverflow.com/questions/7310559/the-best-way-to-remove-array-element-by-value
				var index = room.users_in_room.indexOf(socket.currentUser);
				if (index >= 0) {
				  room.users_in_room.splice( index, 1 );
					room.users_in_room.splice( index, 1 );
				}
				console.log("Users currently in "+ socket.currentRoom+":");
				console.log(room.users_in_room);
				socket.emit("users_in_room",{users_in_room: room.users_in_room});
			}
		});
		console.log(socket.currentUser + " is leaving room: "+ socket.currentRoom);
		socket.currentRoom = data.current_room; //Update client's room
		
		
		newChatroom = new ChatRoom(socket.currentRoom, data.RoomPass,data.Owner);
		//newChatroom.users_in_room.push(currentUser);

		
		socket.join(socket.currentRoom);
		socket.broadcast.to(socket.currentRoom).emit('message_to_client',{  username: "SYSTEM",
																			message: socket.currentUser + ' has joined this room'});
		console.log(socket.currentUser + " is entering room: "+ socket.currentRoom);
		
		if( ! chatRoomNames.includes(socket.currentRoom) ){
			chatRoomNames.push(socket.currentRoom);
			chatRooms.push(newChatroom);
		}
		else{
			chatRooms.forEach(function(room){
				if(room.name === socket.currentRoom){
					if(!room.users_in_room.includes(socket.currentUser) && socket.currentUser!== "Anonymous" && socket.currentUser!== undefined){
						room.users_in_room.push(socket.currentUser);
					}
					console.log("Users currently in "+ socket.currentRoom+":");
					console.log(room.users_in_room);
					
				}
				});
			}
		
		console.log(chatRoomNames);
		console.log("Room passwords:");
		chatRooms.forEach(function(room){
			console.log(room.password);
			if(room.name === socket.currentRoom){
				socket.emit("owner_to_client", {owner: room.creator} );
				socket.emit("users_in_room",{users_in_room: room.users_in_room});
			}
		});
	});

	socket.on('message_to_server', function(data) {
		// This callback runs when the server receives a new message from the client.
		console.log("Room: "+ socket.currentRoom + " message: "+ data.message); // log it to the Node.JS output
		//io.sockets.emit("message_to_client",{message:data.message}); // broadcast the message to other users
		//socket.broadcast.to(socket.currentRoom).emit('message_to_client',{message: data.message});
		io.to(socket.currentRoom).emit('message_to_client',{username: socket.currentUser,message:data.message});
	});
	socket.on("update_rooms", function(data){
		console.log("A new room request for  "+ data.NewRoom + " was made with password "+ data.RoomPass );
		io.sockets.emit("update_client_rooms",{NewRoom: data.NewRoom,
												Password: data.RoomPass});	
	});

	socket.on("addUser", function(currentUser){
		//code adapted from Mozilla Developer and http://stackoverflow.com/questions/19156636/node-js-and-socket-io-creating-room
		if (usernames.indexOf(currentUser) === -1) {
				//add currentUser to the array of usernames 
				usernames.push(currentUser);
				socket.emit("Succeed", currentUser);
				socket.currentUser = currentUser;
				socket.join(currentUser);
				console.log('Your username will be ' + currentUser);
		} else if (usernames.indexOf(currentUser) > -1) {
				console.log('The username ' + currentUser + ' already exists, please create another one');
				socket.emit("FailAdd");
			}
}	);
//http://stackoverflow.com/questions/6477770/socket-io-how-to-broadcast-messages-on-a-namespace to broadcast to a specific room
	socket.on("banned", function(banned, owner) {
		if (owner == this.creator){
			//notify on people in that room
			io.sockets.in(socket.room).emit("banRedirect", {banned: banned, room: room});
			usernames[banned] = "Lobby";
		}
		else {
			console.log("You do not have permission to do this");
		}
	});

	socket.on("kick", function(kicked, owner){
		if (owner == this.creator) {
			//notify only people in that room
			io.sockets.in(socket.room).emit("kickRedirect", kicked);
			console.log(kicked + "has been kicked out of this room");
			usernames[kicked] = "Lobby"; 
		}
		else{
			console.log("You do not have persmission to do this");
		}
	});

	socket.on("privateMessage", function(receiver, message, sender){
		//check if the two users are located in the same room
		socket.join(receiver);
		socket.broadcast.to(receiver).emit("privMsg", receiver, message, sender);
		socket.leave(receiver);
	});

	socket.on("changeOwner", function(newOwner, oldOwner){
		chatRooms.forEach(function(room){
			if(room.name === socket.currentRoom){
				console.log(oldOwner + room.creator);
				if (oldOwner == room.creator) {
					room.creator = newOwner;
					console.log(newOwner + " is now the creator of this room");
				}
				else{
					console.log("You cannot change the owner of the room");
				}
			}
		});
	});
	socket.on("typing",function(){
		io.to(socket.currentRoom).emit('someone_is_typing',{username: socket.currentUser});
	});
});