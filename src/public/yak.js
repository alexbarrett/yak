var socket = io();

var babble = document.getElementById('babble');
var yak = document.getElementById('yak');

var pinned = true; // Autoscroll with new content.
var typingState = 0; // 0 = not typing, 1 = actively typing, 2 = started but now stopped

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
  layout();
}

function layout() {
  if (pinned) {
    babble.scrollTop = babble.scrollHeight;
  }
}

window.addEventListener('resize', layout);

babble.addEventListener('scroll', function (e) {
  pinned = (babble.scrollHeight - babble.clientHeight <= babble.scrollTop + 8);
});

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

function setTypingState(value) {
  if (typingState !== value) {
    typingState = value;
    socket.emit('typing', value);
  }
}

var typingStateTimeout;
yak.addEventListener('input', function (e) {
  setTypingState(1); // Actively typing
  clearTimeout(typingStateTimeout);

  typingStateTimeout = setTimeout(function () {
    setTypingState(2); // Started but now stopped

    typingStateTimeout = setTimeout(function () {
      setTypingState(0); // Not typing
    }, 30000);
  }, 5000);
});

socket.on('typing', function(msg) {
  switch (msg.typingState) {
    case 0:
      console.log('%s stopping typing', msg.handle);
      break;
    case 1:
      console.log('%s is typing', msg.handle);
      break;
    case 2:
      console.log('%s is thinking', msg.handle);
      break;
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
