var socket = io();

var babble = document.getElementById('babble');
var yak = document.getElementById('yak');

function send(text) {
  socket.emit('yak', text);
}

function add(msg) {
  var body = el('div');
  body.innerHTML = msg.markup;
  var msgEl = el('div',
    el('strong', msg.handle),
    ' ',
    body
  );
  msgEl.className = 'msg';
  babble.appendChild(msgEl);
}

socket.on('recv', function (msg) {
  updatePrompt();
  yak.value = '';
  yak.readOnly = false;
  resize();
  add(msg);
});

socket.on('babble', function (msg) {
  add(msg);
});

yak.addEventListener('keydown', function (e) {
  var mod = e.altKey || e.ctrlKey || e.shiftKey; 
  if (e.keyCode == 13 && !mod) {
    e.preventDefault();
    yak.readOnly = true;
    send(yak.value);
  }
});

yak.addEventListener('input', resize);

var prompts = [
  "Write a message",
  "Say something eloquent",
  "Spam a meme",
  "Get it off your chest",
  "Tell us about yourself"
];
function updatePrompt() {
  var randomIndex = Math.floor(Math.random() * prompts.length);
  yak.placeholder = prompts[randomIndex];
}
updatePrompt();

function resize() {
  var style = getComputedStyle(yak);
  var vp = parseInt(style.paddingTop, 10) + parseInt(style.paddingBottom, 10);
  var lh = parseInt(style.lineHeight, 10);
  yak.style.height = '';
  var lines = (yak.scrollHeight - vp) / lh;
  yak.style.height = (lines * 1.5) + 'em';
}

function el(tag, ...children) {
  var el = document.createElement(tag);
  for (var child of children) {
    if (typeof child === 'string') {
      el.insertAdjacentText('beforeend', child);
    }
    else {
      el.appendChild(child);
    }
  }
  return el;
}
