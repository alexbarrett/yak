var koa = require('koa');
var static = require('koa-static');
var pug = require('pug');
var util = require('util');
var path = require('path');

var name = require('./name');
var kappa = require('./kappa');

var app = koa();
app.proxy = true;

// logger

function timestamp(date) {
  date = date || new Date();
  var pad = (str) => str > 9 ? str : '0' + str;
  return util.format('[%s:%s:%s]',
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  );
}

function log() {
  var str = util.format.apply(util, arguments);
  console.log('%s %s', timestamp(), str);
}

app.use(function* (next) {
  var start = new Date;
  yield next;
  var ms = new Date - start;
  log('%s %s - %s', this.method, this.url, ms);
});

// response

app.use(static(path.resolve(__dirname, 'public')));

app.use(function* () {
  this.body = pug.renderFile(path.resolve(__dirname, 'yak.pug'));
});

var server = require('http').createServer(app.callback());
var io = require('socket.io')(server);
var md = new require('markdown-it')({
  linkify: true,
  typographer: true,
});
md.use(require('markdown-it-emoji'));

io.on('connection', function (socket) {
  var ip = socket.handshake.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
  var handle = name(ip);
  log("'%s' connected from %s", handle, ip);

  socket.on('disconnect', function() {
    log("'%s' disconnected", handle);
  });

  socket.on('yak', function (text) {
    log('<%s> %s', handle, text);
    var markup = md.renderInline(text);
    var markup = kappa(markup);
    var msg = { handle, markup };
    socket.emit('recv', msg);
    socket.broadcast.emit('babble', msg);
  });
});

server.listen(80);
log('Listening on port 80');
