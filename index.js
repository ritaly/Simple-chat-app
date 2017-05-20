var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server);
mongo = require('mongodb').MongoClient;

server.listen(process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});


mongo.connect('mongodb://Rita:ritalubiczekolade@ds147821.mlab.com:47821/simple_chat', function(err, db){
  if (err) throw err;

  io.sockets.on('connection', function(socket) {
    console.log("Socket connected.");
    var col = db.collection('messages');

    col.find().toArray(function(err, res) {
      if (err) throw err;
      socket.emit('output', res);
    });

    socket.on('message', function(msg) {

      var whitespacePattern = /^\s*$/;

      if (whitespacePattern.test(msg.username) || whitespacePattern.test(msg.message)) {
        socket.emit('er', "Wiadomość i nazwa użytkownika nie może być pusta.");
      } else {
        col.insert({
          username: msg.username,
          message: msg.message
        })
        io.emit('message', {
          message: msg.message,
          username: msg.username
        });
      }

    });

  });

});
