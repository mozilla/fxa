var crypto = require('crypto');
var uuid = require('uuid');

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

function getUserId() {
  return uuid.v4();
}

function getSessionId() {
  return uuid.v4();
}

module.exports = {
  getKA: getKA,
  getDeviceId: getDeviceId,
  getUserId: getUserId,
  getSessionId: getSessionId,
  getAccountToken: getAccountToken,
  getSignToken: getSignToken
};
