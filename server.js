const express = require('express');
const cors = require('cors');
let app = express();
app.use(express.static('public'));
app.use(cors());

const http = require('http');
const server = http.createServer(app);

const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.NODE_CHAT_PORT || 8080;

// Chargement du fichier index.html affiché au client
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

// Chargement de socket.io
const { Server } = require("socket.io");
const io = new Server(server);
let htmlEscape = require('secure-filters').html;

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', (socket) => {
	
	// Evenement lorsqu'un utilisateur se connecte
	socket.on('connected', (data) => {
		console.log(`${data.uname} has joined the chat`);

		data.uname = htmlEscape(data.uname);		
		data.message = data.uname + ' connected to the chat!';
		socket.broadcast.emit('sysmsg', data);
		socket.emit('sysmsg', data);
	});
	
	// Evenement lorqu'un utilisateur envoie un message
  	socket.on('sendmsg', (data) => {
  		data.message = htmlEscape(data.message);    	
    	
		socket.broadcast.emit('newmsg', data);    
		socket.emit('newmsg', data);    
   	});
	
	// Evenement lorsque quelqu'un se déconnecte
   	socket.on('disconnect', (data) => {		
		console.log(`Someone has left the chat`);
		
		socket.broadcast.emit('sysmsg', {message: 'Somebody left the chat.'});
   	});
});

server.listen(PORT);

console.log(`Server listening on port ${PORT}`);