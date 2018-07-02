var util = require("util");
var moniker = require("moniker");

var adj = moniker.adjective().words;
var noun = moniker.noun().words;

// Java's String.hashCode()
function hashCode(str) {
  var hash = 0;
  if (str.length == 0) {
    return hash;
  }
  for (i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

function pick(items, n) {
  var len = items.length;
  n = ((n % len) + len) % len;
  return items[n];
}

function name(fingerprint) {
  var n = hashCode(fingerprint);
  return util.format("%s-%s", pick(adj, n), pick(noun, n));
}

module.exports = name;
