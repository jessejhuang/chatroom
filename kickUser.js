//function is run when kick button is clicked
function kickUser() {
	var kicked = document.getElementById("kickText").value;
	var owner = currentUser;
	socketio.emit("kick", kicked, owner);
}
//vv code below only if you have a second...less pertinent (BEN)
//if user is kicked out want to redirect them to the lobby
socket.io("kickRedirect", function(kicked){
	if (currentUser == kicked) {
	socketio.emit("room_to_server",{current_room:"Lobby", RoomPass:""});
	alert("User was successfully kicked out");
	}
});
