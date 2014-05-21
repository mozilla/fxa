define(function(require,module,exports){
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var libs = require("../libs/minimal");

function InputException(message) {
  this.message = message;
  this.toString = function() { return "Malformed input: "+this.message; };
}

var int2char = libs.int2char;

// convert a base64url string to hex
var b64urlmap="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
function b64urltohex(s) {
  var ret = "";
  var i;
  var k = 0; // b64 state, 0-3
  var slop;
  for(i = 0; i < s.length; ++i) {
    var v = b64urlmap.indexOf(s.charAt(i));
    if(v < 0) continue;
    if(k === 0) {
      ret += int2char(v >> 2);
      slop = v & 3;
      k = 1;
    }
    else if(k === 1) {
      ret += int2char((slop << 2) | (v >> 4));
      slop = v & 0xf;
      k = 2;
    }
    else if(k === 2) {
      ret += int2char(slop);
      ret += int2char(v >> 2);
      slop = v & 3;
      k = 3;
    }
    else {
      ret += int2char((slop << 2) | (v >> 4));
      ret += int2char(v & 0xf);
      k = 0;
    }
  }
  if(k === 1) {
    ret += int2char(slop << 2);
  }

  // initial 0? only one for now
  if (ret[0] === '0') {
    return ret.substring(1);
  } else {
    return ret;
  }
}

function hex2b64urlencode(arg) {
  // consider the case where the hex is not a
  // proper number of octets.
  if ((arg.length % 2) !== 0) {
    arg = "0" + arg;
  }

  return libs.hex2b64(arg).split('=')[0]
    .replace(/\+/g, '-')  // 62nd char of encoding
    .replace(/\//g, '_'); // 63rd char of encoding
}

function base64urlencode(arg) {
  var s = window.btoa(arg);
  s = s.split('=')[0]; // Remove any trailing '='s
  s = s.replace(/\+/g, '-'); // 62nd char of encoding
  s = s.replace(/\//g, '_'); // 63rd char of encoding
  // TODO optimize this; we can do much better
  return s;
}

function base64urldecode(arg) {
  var s = arg;
  s = s.replace(/-/g, '+'); // 62nd char of encoding
  s = s.replace(/_/g, '/'); // 63rd char of encoding
  switch (s.length % 4) { // Pad with trailing '='s
  case 0:
    break; // No pad chars in this case
  case 2:
    s += "==";
    break; // Two pad chars
  case 3:
    s += "=";
    break; // One pad char
  default:
    throw new InputException("Illegal base64url string!");
  }
  return window.atob(s); // Standard base64 decoder
}

function copyInto(oldObj, newObj) {
  for (var k in oldObj) {
    if (oldObj.hasOwnProperty(k)) newObj[k] = oldObj[k];
  }
}

function getDate(d) {
  if (!d)
    return null;

  var r = new Date();
  r.setTime(d);
  return r;
}

// delay a function
function delay(cb) {
  var delayedFunction = function() {
    var funcArguments = arguments;
    setTimeout(function() {
      cb.apply(cb, funcArguments);
    }, 0);
  };

  return delayedFunction;
}

exports.b64urltohex = b64urltohex;
exports.hex2b64urlencode = hex2b64urlencode;
exports.base64urldecode = base64urldecode;
exports.base64urlencode = base64urlencode;
exports.copyInto = copyInto;
exports.getDate = getDate;
exports.delay = delay;
return exports;
});
