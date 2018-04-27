var util = require('util');

var data = require('./global');

var emotes = Object.keys(data.emotes).reduce(function (acc, emote) {
  acc.push(emote);
  return acc;
}, []);
emotes.reverse();

var RE = new RegExp(emotes.join('|'), 'g');

module.exports = function (str) {
  return str.replace(RE, function(emote) {
    var id = data.emotes[emote].image_id;
    var src = data.template.small.replace('{image_id}', id);
    return util.format('<img src="%s" class="twitch-emote">', src);
  });
};