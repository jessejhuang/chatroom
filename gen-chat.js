var room_name;
var currentUser = "Anonymous";
$( document ).ready(function() {

});

function loadChatRoom(room,password){
	
	socketio.emit("room_to_server",{current_room:room,
									RoomPass: password,
									Owner: currentUser});
	
	$("#chatroom").html("<b>"+room+"</b><br><div id=\"chatlog\"></div>"+
						"<input type=\"text\" id=\"message_input\"/>"+
						 "<button onclick=\"sendMessage();\">Send</button>"
						);
	//Send chatroom to server to be stored inside array, will be created if doesn't exist
	var searchTimeout;
	//from http://stackoverflow.com/questions/359887/determine-when-an-user-is-typing
    document.getElementById('message_input').onkeypress = function () {
        if (searchTimeout !== undefined) clearTimeout(searchTimeout);
			searchTimeout = setTimeout(callServerScript, 250);
		};
    function callServerScript() {
        socketio.emit("typing");
    }	
}
	socketio.on("users_in_room",function(data){
		$("#userlist").remove();
		$("#create").after("<div id= \"userlist\"><b>Users in this room</b></div>");
		data.users_in_room.forEach(function(user){
			document.getElementById("userlist").appendChild(document.createElement("hr") );
			$("#userlist").append("<a href=# onclick=\"directMessage(\'" + user+ "\');\">" + user + "</a>");
			//document.getElementById("userlist").appendChild(document.createTextNode(user));
			
			});
		
		});
	socketio.on("owner_to_client",function(data){
		$("#chatlog").before("Owner: "+ data.owner + "<br>");
		});

      socketio.on("message_to_client",function(data) {
         //Append an HR thematic break and the escaped HTML of the new message
         document.getElementById("chatlog").appendChild(document.createElement("hr"));
		 var speaker = document.createElement("b");
		 speaker.innerHTML=data.username +":  ";
		 document.getElementById("chatlog").appendChild(speaker);
         document.getElementById("chatlog").appendChild(document.createTextNode(data.message));//['message']));
		 document.getElementById("chatlog").lastElementChild.scrollIntoView();

      }); 
	socketio.on("update_client_rooms",function(data){
		//alert(data.Password);
		makeButton(data.NewRoom,data.Password);
		});
	socketio.on("someone_is_typing",function(data){
		 //The one who is typing
		 $("#chatlog").append("<p id =\"is_typing\">\n"+ data.username + " is typing...</p>" );
		 setTimeout(function(){
			$("#is_typing").remove();
			},1000);
		});
      function sendMessage(){
         var msg = document.getElementById("message_input").value;
         socketio.emit("message_to_server", {message:msg});//Can add user to this json
      }
      
    