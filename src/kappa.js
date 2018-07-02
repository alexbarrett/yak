var util = require("util");
var escapeRE = require("escape-string-regexp");

var twitch = require("./global");
var bttv = require("./bttv");

var emotes = [];
var src = {};

for (var emote in twitch.emotes) {
  emotes.push(emote);
  src[emote] = twitch.template.small.replace(
    "{image_id}",
    twitch.emotes[emote].image_id
  );
}
for (var emote of bttv.emotes) {
  emotes.push(emote.code);
  src[emote.code] = bttv.urlTemplate
    .replace("{{id}}", emote.id)
    .replace("{{image}}", "1x");
}

emotes.sort();
emotes.reverse();
var RE = new RegExp("\b" + emotes.map(escapeRE).join("|") + "\b", "g");

module.exports = function(str) {
  return str.replace(RE, function(emote) {
    return util.format(
      '<img src="%s" title="%s" class="twitch-emote">',
      src[emote],
      emote
    );
  });
};
