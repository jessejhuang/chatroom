socketio.on("privMsg", function(receiver, message, sender){
	if(receiver === currentUser){
		alert("Message from: "+ sender + " to: "+ receiver + "\n"+ message);
 	}
});

function directMessage(user) { //what should it intake as the parameter (BEN)
	var message = prompt("Enter your direct message in the space below:", "message");
	var receiver = user;
	var sender = currentUser;
	socketio.emit("privateMessage", receiver, message, sender);
}

