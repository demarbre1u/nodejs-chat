const http = require('http');
const fs = require('fs');

const PORT = 8080;

// Chargement du fichier index.html affiché au client
let server = http.createServer((req, res) => {

	console.log(req.url)

	req.url = req.url === '/' ? 'index.html' : req.url;

	fs.readFile(`./${req.url}`, 'utf-8', (error, content) => {
		res.writeHead(200);
		res.end(content);
	});

	/*
    fs.readFile('./index.html', 'utf-8', (error, content) => {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
	});
	*/
});

// Chargement de socket.io
let io = require('socket.io').listen(server);
let htmlEscape = require('secure-filters').html;

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', (socket) => {
	
	socket.on('connected', (data) => {

		console.log(`${data.uname} has joined the chat`);

		data.uname = htmlEscape(data.uname);		
		data.message = data.uname + ' connected to the chat!';
		socket.broadcast.emit('sysmsg', data);
		socket.emit('sysmsg', data);
	});
    
  	socket.on('sendmsg', (data) => {
  		data.message = htmlEscape(data.message);    	
    	
		socket.broadcast.emit('newmsg', data);    
		socket.emit('newmsg', data);    
   	});
    
   	socket.on('disconnect', (data) => {		
		console.log(`Someone has left the chat`);
		
		socket.broadcast.emit('sysmsg', {message: 'Somebody left the chat.'});
   	});
});

server.listen(PORT);

console.log(`Server listening on port ${PORT}`);