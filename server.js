const express = require('express');
const cors = require('cors');
let app = express();
app.use(express.static('public'));
app.use(cors());

const http = require('http');
const server = http.createServer(app);

const dotenv = require('dotenv');
dotenv.config();

const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || process.env.NODE_CHAT_PORT || 8080;

// Chargement de socket.io
const { Server } = require("socket.io");
const io = new Server(server);
let htmlEscape = require('secure-filters').html;

const colorsArray = ['#00d1b2', '#485fc7', '#3e8ed0', '#48c78e', '#f14668'];
const pickRandomColor = () => {
	const randomIndex = Math.round(Math.random() * (colorsArray.length - 1));
	const color = colorsArray[randomIndex];

	return color;
};

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', (socket) => {
	
	// Evenement lorsqu'un utilisateur se connecte
	socket.on('connected', (data) => {
		console.log(`${data.uname} has joined the chat`);

		data.uname = htmlEscape(data.uname);		
		data.message = data.uname + ' connected to the chat!';

		// On donne un uuid à l'utilisateur
		const uuid = uuidv4();
		socket.uuid = uuid;
		socket.uname = data.uname;
		socket.msgColor = pickRandomColor();

		socket.emit('chatJoined', {uuid});

		socket.broadcast.emit('sysmsg', data);
		socket.emit('sysmsg', data);
	});
	
	// Evenement lorqu'un utilisateur envoie un message
  	socket.on('sendmsg', (data) => {
  		data.message = htmlEscape(data.message);    	
  		data.uuid = socket.uuid;    	
  		data.msgColor = socket.msgColor;    	
    	
		socket.broadcast.emit('newmsg', data);    
		socket.emit('newmsg', data);    
   	});
	
	// Evenement lorsque quelqu'un se déconnecte
   	socket.on('disconnect', (data) => {		
		console.log(`${socket.uname} has left the chat`);
		
		socket.broadcast.emit('sysmsg', {message: `${socket.uname} left the chat.`});
   	});
});

server.listen(PORT);

console.log(`Server listening on port ${PORT}`);
