/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const P = require('../promise');
const hkdf = require('./hkdf');
const butil = require('./butil');

module.exports = function(log, config) {
  const scrypt = require('./scrypt')(log, config);

  const hashVersions = {
    0: function(authPW, authSalt) {
      return P.resolve(butil.xorBuffers(authPW, authSalt));
    },
    1: function(authPW, authSalt) {
      return scrypt.hash(authPW, authSalt, 65536, 8, 1, 32);
    },
  };

  function Password(authPW, authSalt, version) {
    version = typeof version === 'number' ? version : 1;
    this.authPW = Buffer.from(authPW, 'hex');
    this.authSalt = Buffer.from(authSalt, 'hex');
    this.version = version;
    this.stretchPromise = hashVersions[version](this.authPW, this.authSalt);
    this.verifyHashPromise = this.stretchPromise.then(hkdfVerify);
  }

  Password.prototype.stretchedPassword = function() {
    return this.stretchPromise;
  };

  Password.prototype.verifyHash = function() {
    return this.verifyHashPromise;
  };

  Password.prototype.matches = function(verifyHash) {
    return this.verifyHash().then(hash => {
      return butil.buffersAreEqual(hash, verifyHash);
    });
  };

  Password.prototype.unwrap = function(wrapped, context) {
    context = context || 'wrapwrapKey';
    return this.stretchedPassword().then(stretched => {
      return hkdf(stretched, context, null, 32).then(wrapper => {
        return butil.xorBuffers(wrapper, wrapped).toString('hex');
      });
    });
  };
  Password.prototype.wrap = Password.prototype.unwrap;

  function hkdfVerify(stretched) {
    return hkdf(stretched, 'verifyHash', null, 32).then(buf =>
      buf.toString('hex')
    );
  }

  Password.stat = function() {
    // Reset the high-water-mark whenever it is read.
    const numPendingHWM = scrypt.numPendingHWM;
    scrypt.numPendingHWM = scrypt.numPending;
    return {
      stat: 'scrypt',
      maxPending: scrypt.maxPending,
      numPending: scrypt.numPending,
      numPendingHWM: numPendingHWM,
    };
  };

  return Password;
};
