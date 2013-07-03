/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var crypto = require('crypto');
var uuid = require('uuid');
var HKDF = require('hkdf');
var bigint = require('bigint');

function KW(name) {
  return 'identity.mozilla.com/picl/v1/' + name;
}

// HMAC key derivation function helper
//
// arguments:
//
//  km: key material
//  info: context info
//  salt: salt (may be null)
//  len: length of derived key
//  cb: callback with sig: function(key) { ... }
function hkdf(km, info, salt, len, cb) {
  var df = new HKDF('sha256', salt, km);
  df.derive(KW(info), len, cb);
}

function getKA(cb) {
  return crypto.randomBytes(32, function(err, buf) {
    cb(null, buf.toString('base64'));
  });
}

function getDeviceId(cb) {
  return crypto.randomBytes(32, function(err, buf) {
    cb(null, buf.toString('hex'));
  });
}

function getAccountToken(cb) {
  return crypto.randomBytes(32, function(err, buf) {
    cb(null, buf.toString('hex'));
  });
}

function getSignToken(cb) {
  return crypto.randomBytes(32, function(err, buf) {
    cb(null, buf.toString('hex'));
  });
}

function getResetToken(cb) {
  return crypto.randomBytes(32, function(err, buf) {
    cb(null, buf.toString('hex'));
  });
}

function getUserId() {
  return uuid.v4();
}

function getSessionId() {
  return uuid.v4();
}

// Derive a respHMACkey and a respXORkey from an SRP session key,
function srpResponseKeys(srpK, cb) {
  // hkdf with no salt and srpK as key material
  hkdf(srpK, 'getSignToken', null, 4 * 32, function(key) {
    cb(null, {
      respHMACkey: key.slice(0, 32),
      respXORkey: key.slice(32, 128)
    });
  });
}

// Derive a tokenId and reqHMACkey from the signToken
function signCertKeys(signToken, cb) {
  hkdf(signToken, 'signCertificate', null, 2 * 32, function (key) {
    cb(null, {
      tokenId: key.slice(0, 32),
      reqHMACkey: key.slice(32, 64)
    });
  });
}

// generates the encrypted bundle for getSignToken2
// params should be Buffer instances
//
// params: {
//  kA: kA,
//  wrapKb: wrapKb,
//  signToken: signToken,
//  hmacKey: respHMACkey,
//  encKey: respXORkey
// }
function srpSignTokenBundle(params) {

  var payload = Buffer.concat([params.kA, params.wrapKb, params.signToken]);

  // xor the response with the encryption key
  var bundle = bigint.fromBuffer(payload).
                 xor(bigint.fromBuffer(params.encKey));

  var ciphertext = bundle.toBuffer();

  var hmac = crypto.createHmac('sha256', params.hmacKey);
  hmac.update(ciphertext);

  // return the ciphertext concatenated with the MAC
  return Buffer.concat([ciphertext, hmac.digest()]);
}

module.exports = {
  hkdf: hkdf,
  getKA: getKA,
  getDeviceId: getDeviceId,
  getUserId: getUserId,
  getSessionId: getSessionId,
  getAccountToken: getAccountToken,
  getSignToken: getSignToken,
  getResetToken: getResetToken,
  srpResponseKeys: srpResponseKeys,
  srpSignTokenBundle: srpSignTokenBundle,
  signCertKeys: signCertKeys
};
