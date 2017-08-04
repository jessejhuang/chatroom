function banUser(){
	var banned = document.getElementById("banText").value;
	var owner = currentUser;
	alert("This button has been pushed");
	socketio.emit("banned", banned, owner);
}
//if user is banned want to redirect them to the lobby
socket.io("banRedirect", function(data){
	var banned = data.banned;
	var room = data.room;
	// bannedUsers[room] = banned;
	if (currentUser === banned) {
	bannedUsers.push(banned);	
	socketio.emit("room_to_server",{current_room:"Lobby", RoomPass:""});
	alert("User was successfully banned");
	}
});
