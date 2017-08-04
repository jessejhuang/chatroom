$( document ).ready(function() {
	
	$( "#make_room" ).on( "click", function() {
		makeRoom();
		//loadChatRoom(room_name);
    });
});
function makeRoom(){
	room_name = document.getElementById("room_name").value; // Get the username from the form
	room_name = room_name.replace(/ /g, '_'); //Replace spaces with underscore
	var password= document.getElementById("password").value; // if none entered, password === ""
	makeButton(room_name,password);
	socketio.emit("update_rooms", {NewRoom:room_name,
									RoomPass: password});
	loadChatRoom(room_name,password);
}
function makeButton(new_room,password){
	if( $("#"+new_room).length > 0){
		console.log("A room with this name already exists.");
	}
	else{
		$("#buttons").append("<button id = \""+ new_room + "\" class =\""+ password +"\">" + new_room + "</button>");
			$("#" + new_room).on("click",function(){
				//alert(this.className);
				if(this.className ===""){
					console.log(this.id);
					loadChatRoom(this.id,"");
				}else{
					//alert(this.className);
					var roompass = this.className;
					var submitID = this.id + "q";
					$("#chatroom").html("<b>"+new_room+"</b><br>"+
					"<input type=\"password\" id=\"check_pass\" placeholder = \"password\"/>"+
					 "<button id = \""+submitID+"\" class =\""+ roompass +"\"onclick=\"checkPass(this.id,this.className);\">Submit</button>"
					);
					console.log(this.id);
					//loadChatRoom(this.id);
					
				}	
			});
	}
}
function checkPass(private_room, password){
	var enteredPass = document.getElementById("check_pass").value;
	//alert("checking pass");
	private_room = private_room.substring(0, private_room.length -1);
	if(password === enteredPass){
		//alert(" Room name: "+private_room+" \nPassword entered: "+ enteredPass+ "\n Real password: "+ password );
		loadChatRoom(private_room,enteredPass);
	}
	else{
		//alert("Incorrect- Room name: "+private_room+" \nPassword entered: "+ enteredPass+ "\n Real password: "+ password );
		alert("Incorrect room password.");
	}
}

