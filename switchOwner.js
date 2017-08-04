function switchOwner(){
var newOwner = document.getElementById("changeOwnerText").value;
var oldOwner = currentUser;
socketio.emit("changeOwner", newOwner, oldOwner); 
console.log("The change owner button has been clicked and emitted");
alert("The change owner button has been clicked");
}

