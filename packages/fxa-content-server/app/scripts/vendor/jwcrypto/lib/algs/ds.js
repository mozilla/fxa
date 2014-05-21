define(function(require,module,exports){
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var algs = require("./index");
var libs = require("../../libs/minimal");
var version = require("../version");
var BigInteger = libs.BigInteger;

var HASH_ALGS = {
  "sha1": libs.hex_sha1,
  "sha256": function(message) {return libs.sjcl.codec.hex.fromBits(libs.sjcl.hash.sha256.hash(message));}
};

function doHash(hashAlg, message /*, modulus */) {
  // updated for FIPS186-3, section 4.6, and integer/string conversion as per appendix c.2
  var raw_hash = HASH_ALGS[hashAlg](message);

  // not really taking the minlength of bitlength and hash output, because assuming
  // that the parameters we use match hash-output bitlength.

  // we don't actually need to do modulus here, because of the previous assumption
  return new BigInteger(raw_hash, "16");
}

// pad with leading 0s a hex string
function hex_lpad(str, length) {
  while (str.length < length) {
    str = "0" + str;
  }
  return str;
}

// supported keysizes
// the Diffie-Hellman group is specified for each keysize
// this means we don't need to specify a parameter generation step.
var KEYSIZES = {
  // 160 is the keysize for standard DSA
  // the following are based on the first FIPS186-3 test vectors for 1024/160 SHA-256
  // under the category A.2.3 Verifiable Canonical Generation of the Generator g
  // HOWEVER***** for backwards compatibility we are labeling this 128 for now
  // XXXX this should be changed to 160
  128: {
    p: "ff600483db6abfc5b45eab78594b3533d550d9f1bf2a992a7a8daa6dc34f8045ad4e6e0c429d334eeeaaefd7e23d4810be00e4cc1492cba325ba81ff2d5a5b305a8d17eb3bf4a06a349d392e00d329744a5179380344e82a18c47933438f891e22aeef812d69c8f75e326cb70ea000c3f776dfdbd604638c2ef717fc26d02e17",
    q: "e21e04f911d1ed7991008ecaab3bf775984309c3",
    g: "c52a4a0ff3b7e61fdf1867ce84138369a6154f4afa92966e3c827e25cfa6cf508b90e5de419e1337e07a2e9e2a3cd5dea704d175f8ebf6af397d69e110b96afb17c7a03259329e4829b0d03bbc7896b15b4ade53e130858cc34d96269aa89041f409136c7242a38895c9d5bccad4f389af1d7a4bd1398bd072dffa896233397a",
    hashAlg: "sha1"
  },
  // the following are based on the first FIPS186-3 test vectors for 2048/256 SHA-256
  // under the category A.2.3 Verifiable Canonical Generation of the Generator g
  256: {
    p: "d6c4e5045697756c7a312d02c2289c25d40f9954261f7b5876214b6df109c738b76226b199bb7e33f8fc7ac1dcc316e1e7c78973951bfc6ff2e00cc987cd76fcfb0b8c0096b0b460fffac960ca4136c28f4bfb580de47cf7e7934c3985e3b3d943b77f06ef2af3ac3494fc3c6fc49810a63853862a02bb1c824a01b7fc688e4028527a58ad58c9d512922660db5d505bc263af293bc93bcd6d885a157579d7f52952236dd9d06a4fc3bc2247d21f1a70f5848eb0176513537c983f5a36737f01f82b44546e8e7f0fabc457e3de1d9c5dba96965b10a2a0580b0ad0f88179e10066107fb74314a07e6745863bc797b7002ebec0b000a98eb697414709ac17b401",
    q: "b1e370f6472c8754ccd75e99666ec8ef1fd748b748bbbc08503d82ce8055ab3b",
    g: "9a8269ab2e3b733a5242179d8f8ddb17ff93297d9eab00376db211a22b19c854dfa80166df2132cbc51fb224b0904abb22da2c7b7850f782124cb575b116f41ea7c4fc75b1d77525204cd7c23a15999004c23cdeb72359ee74e886a1dde7855ae05fe847447d0a68059002c3819a75dc7dcbb30e39efac36e07e2c404b7ca98b263b25fa314ba93c0625718bd489cea6d04ba4b0b7f156eeb4c56c44b50e4fb5bce9d7ae0d55b379225feb0214a04bed72f33e0664d290e7c840df3e2abb5e48189fa4e90646f1867db289c6560476799f7be8420a6dc01d078de437f280fff2d7ddf1248d56e1a54b933a41629d6c252983c58795105802d30d7bcd819cf6ef",
    hashAlg: "sha256"
  }
};

function getParams(keysize) {
  return KEYSIZES[parseInt(keysize, 10)];
}

// turn the keysize params to bigints
for (var keysize in KEYSIZES) {
  var the_params = getParams(keysize);
  the_params.p = new BigInteger(the_params.p, "16");
  the_params.q = new BigInteger(the_params.q, "16");
  the_params.g = new BigInteger(the_params.g, "16");

  // sizes
  the_params.q_bitlength = the_params.q.bitLength();
}


function _getKeySizeFromBitlength(size) {
  for (var keysize in KEYSIZES) {
    var keysize_nbits = KEYSIZES[keysize].p.bitLength();
    var diff = keysize_nbits - size;

    // extremely unlikely to be more than 30 bits smaller than p
    // 2^-30. FIXME: should we be more tolerant here.
    if (diff >= 0 && diff < 30) {
      return keysize;
    }
  }

  return null;
}

function randomNumberMod(q, rng) {
  // do a few more bits than q so we can wrap around with not too much bias
  // wow, turns out this was actually not far off from FIPS186-3, who knew?
  // FIPS186-3 says to generate 64 more bits than needed into "c", then to do:
  // result = (c mod (q-1)) + 1
  return new BigInteger(q.bitLength() + 64, rng).mod(q.subtract(BigInteger.ONE)).add(BigInteger.ONE);
}

function generate(keysize, rng, doneCB) {
  var params = getParams(keysize);
  if (!params)
    throw "keysize not supported: " + keysize.toString();

  var keypair = new algs.KeyPair();
  keypair.keysize= keysize;

  // DSA key gen: random x modulo q
  var x = randomNumberMod(params.q, rng);

  // the secret key will compute y
  keypair.secretKey = new SecretKey(x, keypair.keysize, params);
  keypair.publicKey = new PublicKey(keypair.secretKey.y, keypair.keysize, params);

  keypair.publicKey.algorithm = keypair.secretKey.algorithm = keypair.algorithm = 'DS';

  // XXX - timeout or nexttick?
  doneCB(null, keypair);
}

var PublicKey = function(y, keysize, params) {
  this.y = y;

  if (keysize && params) {
    this.keysize = keysize;

    // copy params
    this.q = params.q;
    this.g = params.g;
    this.p = params.p;
  }
};

PublicKey.prototype = new algs.PublicKey();

PublicKey.prototype._20120815_serializeToObject = function(obj) {
  obj.version = '2012.08.15';
  obj.y = this.y.toBase64();
  obj.p = this.p.toBase64();
  obj.q = this.q.toBase64();
  obj.g = this.g.toBase64();
};

PublicKey.prototype._LEGACY_serializeToObject = function(obj) {
  obj.y = this.y.toString(16);
  obj.p = this.p.toString(16);
  obj.q = this.q.toString(16);
  obj.g = this.g.toString(16);
};

PublicKey.prototype.serializeToObject = version.versionDispatcher('serializeToObject');

PublicKey.prototype.equals = function(other) {
  // if other is falsey, then there is no match.
  if (!other) {
    return false;
  }

  return (other.algorithm === this.algorithm &&
          this.p.equals(other.p) &&
          this.y.equals(other.y) &&
          this.g.equals(other.g) &&
          this.q.equals(other.q));
};

PublicKey.prototype._LEGACY_deserializeFromObject = function(obj) {
  this.p = new BigInteger(obj.p, 16);
  this.q = new BigInteger(obj.q, 16);
  this.g = new BigInteger(obj.g, 16);
  this.y = new BigInteger(obj.y, 16);
};

PublicKey.prototype._20120815_deserializeFromObject = function(obj) {
  this.p = BigInteger.fromBase64(obj.p);
  this.q = BigInteger.fromBase64(obj.q);
  this.g = BigInteger.fromBase64(obj.g);
  this.y = BigInteger.fromBase64(obj.y);
};

PublicKey.prototype.deserializeFromObject = function(obj) {
  version.dispatchOnDataFormatVersion(this, 'deserializeFromObject', obj.version, obj);

  this.keysize = _getKeySizeFromBitlength(this.y.bitLength());
  return this;
};

// note: this deserialization code does not check that the public key is
// well-formed (P and Q are primes, G is actually a generator, etc), and it
// allows the use of any group (instead of being restricted to e.g. the
// ones published by NIST). For sign/verify that is ok: when someone else
// gives a public key, they're instructing us how to distinguish between good
// signatures and forgeries, and giving us a corrupt pubkey is their
// perogative (plus we have no secrets to lose).
//
// Do not use this approach for DH key agreement. In that world, we *do* have
// a private key that could be lost, and a maliciously crafted pubkey could
// be used to learn it. Additional checks would be necessary to do that
// safely.

function SecretKey(x, keysize, params) {
  this.x = x;

  // compute y if need be
  if (params && keysize) {
    this.y = params.g.modPow(this.x, params.p);
    this.keysize = keysize;

    // copy params
    this.q = params.q;
    this.g = params.g;
    this.p = params.p;
  }
}

SecretKey.prototype = new algs.SecretKey();

SecretKey.prototype._LEGACY_serializeToObject = function(obj) {
  obj.x = this.x.toString(16);
  obj.p = this.p.toString(16);
  obj.q = this.q.toString(16);
  obj.g = this.g.toString(16);
};

SecretKey.prototype._20120815_serializeToObject = function(obj) {
  obj.version = '2012.08.15';
  obj.x = this.x.toBase64();
  obj.p = this.p.toBase64();
  obj.q = this.q.toBase64();
  obj.g = this.g.toBase64();
};

SecretKey.prototype.serializeToObject = version.versionDispatcher('serializeToObject');

SecretKey.prototype._LEGACY_deserializeFromObject = function(obj) {
  this.x = new BigInteger(obj.x, 16);

  this.p = new BigInteger(obj.p, 16);
  this.q = new BigInteger(obj.q, 16);
  this.g = new BigInteger(obj.g, 16);
};

SecretKey.prototype._20120815_deserializeFromObject = function(obj) {
  this.x = BigInteger.fromBase64(obj.x);

  this.p = BigInteger.fromBase64(obj.p);
  this.q = BigInteger.fromBase64(obj.q);
  this.g = BigInteger.fromBase64(obj.g);
};

SecretKey.prototype.deserializeFromObject = function(obj) {
  version.dispatchOnDataFormatVersion(this, 'deserializeFromObject', obj.version,
                                   obj);

  this.keysize = _getKeySizeFromBitlength(this.p.bitLength());

  return this;
};


SecretKey.prototype.sign = function(message, rng, progressCB, doneCB) {
  var params = getParams(this.keysize);

  // see https://secure.wikimedia.org/wikipedia/en/wiki/Digital_Signature_Algorithm

  // only using single-letter vars here because that's how this is defined in the algorithm
  var k, r, s;

  // do this until r != 0 (very unlikely, but hey)
  while(true) {
    k = randomNumberMod(this.q, rng);
    r = this.g.modPow(k, this.p).mod(this.q);

    if (r.equals(BigInteger.ZERO)) {
      console.log("oops r is zero");
      continue;
    }

    // the hash
    var bigint_hash = doHash(params.hashAlg, message, this.q);

    // compute H(m) + (x*r)
    var message_dep = bigint_hash.add(this.x.multiply(r).mod(this.q)).mod(this.q);

    // compute s
    s = k.modInverse(this.q).multiply(message_dep).mod(this.q);

    if (s.equals(BigInteger.ZERO)) {
      console.log("oops s is zero");
      continue;
    }

    // r and s are non-zero, we can continue
    break;
  }

  // format the signature, it's r and s
  var hexlength = params.q_bitlength / 4;
  var signature = hex_lpad(r.toString(16), hexlength) + hex_lpad(s.toString(16), hexlength);

  if (!progressCB)
    return signature;
  else
    doneCB(signature);
};

PublicKey.prototype.verify = function(message, signature, cb) {
  var params = getParams(this.keysize);

  // extract r and s
  var hexlength = params.q_bitlength / 4;

  // we pre-pad with 0s because encoding may have gotten rid of some
  signature = hex_lpad(signature, hexlength * 2);

  // now this should only happen if the signature was longer
  if (signature.length !== (hexlength * 2)) {
    //return cb("problem with r/s combo: " + signature.length + "/" + hexlength + " - " + signature);
    return cb("malformed signature");
  }

  var r = new BigInteger(signature.substring(0, hexlength), 16),
      s = new BigInteger(signature.substring(hexlength, hexlength*2), 16);

  // check rangeconstraints
  if ((r.compareTo(BigInteger.ZERO) < 0) || (r.compareTo(this.q) > 0)) {
    //return cb("problem with r: " + r.toString(16));
    return cb("invalid signature");
  }
  if ((s.compareTo(BigInteger.ZERO) < 0) || (s.compareTo(this.q) > 0)) {
    //return cb("problem with s");
    return cb("invalid signature");
  }

  var w = s.modInverse(this.q);
  var u1 = doHash(params.hashAlg, message, this.q).multiply(w).mod(this.q);
  var u2 = r.multiply(w).mod(this.q);
  var v = this.g
    .modPow(u1,this.p)
    .multiply(this.y.modPow(u2,this.p)).mod(this.p)
    .mod(this.q);

  cb(null, v.equals(r));
};

// register this stuff
algs.register("DS", {
  generate: generate,
  PublicKey: PublicKey,
  SecretKey: SecretKey
});

});
