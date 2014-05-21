define(function(require,module,exports){
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * baseline objects for all algorithms
 */

var ALGS = {
};

function KeySizeNotSupportedException(message) {
  this.message = message;
  this.toString = function() { return "Key size not supported: "+this.message; };
}

function NotImplementedException(message) {
  this.message = message;
  this.toString = function() { return "Not implemented: "+this.message; };
}

function KeyPair() {
  this.publicKey = null;
  this.secretKey = null;
  this.algorithm = null;
  this.keysize = null;
}

var _getAlgorithm = function _getAlgorithm() {
  return this.algorithm + this.keysize.toString();
};

KeyPair.prototype = {
  getAlgorithm: _getAlgorithm
};

exports.register = function(alg, cls) {
  ALGS[alg] = cls;
};


function PublicKey() {
}

PublicKey.prototype = {
  // produce a ready-to-be-JSON'ed object
  toSimpleObject: function() {
    var obj = {algorithm: this.algorithm};
    this.serializeToObject(obj);
    return obj;
  },

  // ok, JSON'ify it
  serialize: function() {
    return JSON.stringify(this.toSimpleObject());
  },

  getAlgorithm : _getAlgorithm
};

PublicKey.fromSimpleObject = function(obj) {
  if (!ALGS[obj.algorithm])
    throw new NotImplementedException("no such algorithm: " + obj.algorithm);

  var pk = new ALGS[obj.algorithm].PublicKey();
  pk.algorithm = obj.algorithm;
  pk.deserializeFromObject(obj);
  return pk;
};

PublicKey.deserialize = function(str) {
  var obj = JSON.parse(str);
  return PublicKey.fromSimpleObject(obj);
};


function SecretKey() {
}

SecretKey.prototype = {
  toSimpleObject: function() {
    var obj = {algorithm: this.algorithm};
    this.serializeToObject(obj);
    return obj;
  },

  serialize: function() {
    return JSON.stringify(this.toSimpleObject());
  },

  getAlgorithm: _getAlgorithm

};

SecretKey.fromSimpleObject = function(obj) {
  if (!ALGS[obj.algorithm])
    throw new NotImplementedException("no such algorithm: " + obj.algorithm);

  var sk = new ALGS[obj.algorithm].SecretKey();
  sk.algorithm = obj.algorithm;
  sk.deserializeFromObject(obj);
  return sk;
};

SecretKey.deserialize = function(str) {
  var obj = JSON.parse(str);
  return SecretKey.fromSimpleObject(obj);
};


exports.ALGS = ALGS;
exports.PublicKey = PublicKey;
exports.SecretKey = SecretKey;
exports.KeyPair = KeyPair;
exports.KeySizeNotSupportedException = KeySizeNotSupportedException;
exports.NotImplementedException = NotImplementedException;
return exports;
});
