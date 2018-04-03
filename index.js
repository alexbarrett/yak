var koa = require('koa');
var static = require('koa-static');
var pug = require('pug');

var name = require('./name');
var kappa = require('./kappa');

var app = koa();

// logger

app.use(function* (next) {
  var start = new Date;
  yield next;
  var ms = new Date - start;
  console.log('%s %s - %s', this.method, this.url, ms);
});

// response

app.use(static('public'));

app.use(function* () {
  this.body = pug.renderFile('yak.pug');
});

var server = require('http').createServer(app.callback());
var io = require('socket.io')(server);
var md = new require('markdown-it')({
  linkify: true,
  typographer: true,
});
md.use(require('markdown-it-emoji'));

io.on('connection', function (socket) {
  var fingerprint = socket.request.connection.remoteAddress;
  var handle = name(fingerprint);

  console.log("'%s' connected", handle);
  socket.on('yak', function (text) {
    var markup = md.renderInline(text);
    var markup = kappa(markup);
    var msg = { handle, markup };
    socket.emit('recv', msg);
    socket.broadcast.emit('babble', msg);
  });
});

server.listen(4444);
console.log('Listening on port 4444');
