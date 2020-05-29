/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var crypto = require('crypto');
var base64url = require('base64url');
const { normalizeEmail } = require('fxa-shared').email.helpers;

function hex(len) {
  return crypto.randomBytes(len).toString('hex');
}
function hex16() {
  return hex(16);
}
function hex32() {
  return hex(32);
}
// function hex64() { return hex(64) }
function hex96() {
  return hex(96);
}

function base64(len) {
  return base64url(crypto.randomBytes(len));
}

function base64_16() {
  return base64(16);
}
function base64_65() {
  return base64(65);
}

function buf(len) {
  return Buffer.from(crypto.randomBytes(len));
}
function buf16() {
  return buf(16);
}
function buf32() {
  return buf(32);
}
// function buf64() { return buf(64) }
function buf96() {
  return buf(96);
}

module.exports.newUserDataHex = function () {
  var data = {};

  // account
  data.accountId = hex16();
  data.account = {
    email: hex16() + '@example.com',
    emailCode: hex16(),
    emailVerified: false,
    verifierVersion: 1,
    verifyHash: hex32(),
    authSalt: hex32(),
    kA: hex32(),
    wrapWrapKb: hex32(),
    verifierSetAt: Date.now(),
    createdAt: Date.now(),
  };
  data.account.normalizedEmail = normalizeEmail(data.account.email);

  // sessionToken
  data.sessionTokenId = hex32();
  data.sessionToken = {
    data: hex32(),
    uid: data.accountId,
    createdAt: Date.now(),
    uaBrowser: 'fake browser',
    uaBrowserVersion: 'fake browser version',
    uaOS: 'fake OS',
    uaOSVersion: 'fake OS version',
    uaDeviceType: 'fake device type',
    uaFormFactor: 'fake form factor',
    mustVerify: true,
    tokenVerificationId: hex16(),
    tokenVerificationCode: crypto.randomBytes(4).toString('hex'),
    tokenVerificationCodeExpiresAt: Date.now() + 20000,
  };

  // device
  data.deviceId = hex16();
  data.device = {
    uid: data.accountId,
    sessionTokenId: data.sessionTokenId,
    refreshTokenId: null,
    createdAt: Date.now(),
    name: 'fake device name',
    type: 'fake device type',
    callbackURL: 'fake callback URL',
    callbackPublicKey: base64_65(),
    callbackAuthKey: base64_16(),
    callbackIsExpired: false,
  };

  // oauth device
  data.refreshTokenId = hex32();
  data.oauthDeviceId = hex16();
  data.oauthDevice = {
    uid: data.accountId,
    sessionTokenId: null,
    refreshTokenId: data.refreshTokenId,
    createdAt: Date.now(),
    name: 'fake oauth device name',
    type: 'oauth device',
    callbackURL: 'fake oauth callback URL',
    callbackPublicKey: base64_65(),
    callbackAuthKey: base64_16(),
    callbackIsExpired: false,
  };

  // keyFetchToken
  data.keyFetchTokenId = hex32();
  data.keyFetchToken = {
    authKey: hex32(),
    uid: data.accountId,
    keyBundle: hex96(),
    createdAt: Date.now(),
    tokenVerificationId: data.sessionToken.tokenVerificationId,
  };

  // accountResetToken
  data.accountResetTokenId = hex32();
  data.accountResetToken = {
    tokenId: data.accountResetTokenId,
    data: hex32(),
    uid: data.accountId,
    createdAt: Date.now(),
  };

  // passwordChangeToken
  data.passwordChangeTokenId = hex32();
  data.passwordChangeToken = {
    data: hex32(),
    uid: data.accountId,
    createdAt: Date.now(),
  };

  // passwordForgotToken
  data.passwordForgotTokenId = hex32();
  data.passwordForgotToken = {
    data: hex32(),
    uid: data.accountId,
    passCode: hex16(),
    tries: 1,
    createdAt: Date.now(),
  };

  // email
  data.email = {
    email: hex16() + '@example.com',
    emailCode: hex16(),
    isVerified: 0,
    isPrimary: 0,
    verifiedAt: undefined,
    createdAt: Date.now(),
  };
  data.email.normalizedEmail = normalizeEmail(data.email.email);

  data.totp = {
    sharedSecret: hex(10),
    epoch: 0,
    verified: false,
    enabled: true,
  };

  return data;
};

module.exports.newUserDataBuffer = function () {
  var data = {};

  // account
  data.accountId = buf16();
  data.account = {
    email: hex16() + '@example.com',
    emailCode: buf16(),
    emailVerified: false,
    verifierVersion: 1,
    verifyHash: buf32(),
    authSalt: buf32(),
    kA: buf32(),
    wrapWrapKb: buf32(),
    verifierSetAt: Date.now(),
    createdAt: Date.now(),
  };
  data.account.normalizedEmail = normalizeEmail(data.account.email);

  // sessionToken
  data.sessionTokenId = buf32();
  data.sessionToken = {
    data: buf32(),
    uid: data.accountId,
    createdAt: Date.now(),
  };

  // keyFetchToken
  data.keyFetchTokenId = buf32();
  data.keyFetchToken = {
    authKey: buf32(),
    uid: data.accountId,
    keyBundle: buf96(),
    createdAt: Date.now(),
  };

  // accountResetToken
  data.accountResetTokenId = buf32();
  data.accountResetToken = {
    tokenId: data.accountResetTokenId,
    data: buf32(),
    uid: data.accountId,
    createdAt: Date.now(),
  };

  // passwordChangeToken
  data.passwordChangeTokenId = buf32();
  data.passwordChangeToken = {
    data: buf32(),
    uid: data.accountId,
    createdAt: Date.now(),
  };

  // passwordForgotToken
  data.passwordForgotTokenId = buf32();
  data.passwordForgotToken = {
    data: buf32(),
    uid: data.accountId,
    passCode: buf16(),
    tries: 1,
    createdAt: Date.now(),
  };

  return data;
};
