var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
app.use(express.static(path.join(__dirname, "./static")));
app.use(bodyParser.urlencoded());
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.get('/', function (req, res){
	res.render("index");
});

var server = app.listen(8000);

var io = require('socket.io').listen(server);

//If the chat log is empty, set it to this message
if(!chat_log){
	var chat_log = "<p>Chat Initialized...</p>";
};

//What to do after the connection has been established:
io.sockets.on('connection', function (socket){
	//Log the Socket ID on the server side
	console.log("Socket ID: " + socket.id);

	//When the client requests the log, send it
	socket.on("log_request", function (){
		socket.emit("return_log", {content: chat_log});
	});

	//When a new user name is entered, update the chat log with a notification for all connected sockets and return it
	socket.on("user_entered", function (data){
		chat_log += "<p class=\"notification\"><strong class=\"notification\">" + data.name + "</strong> has joined the chat.</p>";
		io.emit("return_log", {content: chat_log});
	});

	//When the client sends a new message, update the server record of the chat log and send the entire log back to all connected clients
	socket.on("message_submitted", function (data){
		if(data.name != ""){
			chat_log += "<p><strong>" + data.name + " says:</strong> " + data.message_content + "</p>";
			io.emit("return_log", {content: chat_log});
		}
		else{
			socket.emit("username_error");
		};
	});
});