function addUser(){
	//add user, upon adding user is in null area, must click lobby to join
	currentUser = prompt("Please enter your username", "username");
	socketio.emit('addUser', currentUser);
}
//if username does not exist already, succeed
socketio.on("Succeed", function(data){
	alert("Hello " + data);
	$("#user").html("Hello, "+ data + "!");
});
//user cannot be added because the name already exists
socketio.on("FailAdd", function(){
	alert("Username already exists, please create another one");
});