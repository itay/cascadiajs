
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , demo1 = require('./routes/demo1')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 5000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, '..')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

app.post('/demo1', demo1);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = require("socket.io").listen(server);

/*var streams = require('./data');  

io.set('log level', 1);

streams.transform.on("error", function(err) {
  console.log("Transform Stream Error:", err);
});

streams.data.on("error", function(err) {
  console.log("Data Stream Error:", err);
});

io.sockets.on('connection', function (socket) {
  streams.data.connect();
  
  streams.transform.on("data", function(data) {
    socket.emit("data", data);
  });
  
  socket.on('disconnect', function() {
    streams.clear();
    streams.data.disconnect();
  });
});
*/

io.set('log level', 1);

var demo2 = require('./routes/demo2');
io.demo2 = io.of('/demo2').on('connection', function(socket) {
  demo2.raw.connect();
  demo2.transformed.on('data', function(data) {
    socket.emit('data', data);
  });
  
  socket.on('disconnect', function() {
    demo2.raw.disconnect();
  });
});