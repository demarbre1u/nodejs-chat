var http = require('http');
var fs = require('fs');

// Chargement du fichier index.html affiché au client
var server = http.createServer(function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

// Chargement de socket.io
var io = require('socket.io').listen(server);
var htmlEscape = require('secure-filters').html;

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
	
	socket.on('connected', function (data) {
		data.uname = htmlEscape(data.uname);		
		data.message = data.uname + ' connected to the chat!';
   	socket.broadcast.emit('sysmsg', data);
   	socket.emit('sysmsg', data);
	});
    
   socket.on('sendmsg', function (data) {
  		data.message = htmlEscape(data.message);    	
    	
		socket.broadcast.emit('newmsg', data);    
		socket.emit('newmsg', data);    
   });
    
   socket.on('disconnect', function (data) {		
		socket.broadcast.emit('sysmsg', {message: 'Somebody left the chat.'});
   });
});

server.listen(8080);