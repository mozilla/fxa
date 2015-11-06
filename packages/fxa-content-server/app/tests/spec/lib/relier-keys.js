/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var RelierKeys = require('lib/relier-keys');

  var assert = chai.assert;

  // Hand-generated test values for the key derivation protocol.
  var k = '00001111222233334444555566667777';
  var uid = 'someUID';
  var clientId = 'aabbcc';
  var kArID = 'kAr-5t_ELVYhhKZWsPTg7F4nLJo6w-LOKWn8yPlpqQ4cYVQ=';
  var kArBytes = 'XJrppZMmhiF1u-leMgLubr83fTRwAjtiPi8IPW2TP0E=';
  var kBrID = 'kBr-XOmlEIxDGu8QVwmVq1qdle0W6qv4c4zNzby8hbJElPY=';
  var kBrBytes = 'OAIJKvOKVMv20T_JXJO9jiRNeUEHuGSVUcgTrFbjzq0=';

  describe('lib/relier-keys', function () {
    describe('deriveRelierKeys', function () {
      it('derives kAr and kBr keys', function () {
        return RelierKeys.deriveRelierKeys({ kA: k, kB: k }, uid, clientId)
          .then(function (keys) {
            assert.equal(keys.kAr.k, kArBytes);
            assert.equal(keys.kBr.k, kBrBytes);
          });
      });

      it('fails if kA is missing', function () {
        return RelierKeys.deriveRelierKeys({ kB: k }, uid, clientId)
          .then(assert.fail, function (err) {
            assert.ok(err.message.indexOf('missing kA') > -1);
          });
      });

      it('fails if kB is missing', function () {
        return RelierKeys.deriveRelierKeys({ kA: k }, uid, clientId)
          .then(assert.fail, function (err) {
            assert.ok(err.message.indexOf('missing kB') > -1);
          });
      });

      it('fails if uid is missing', function () {
        return RelierKeys.deriveRelierKeys({ kA: k, kB: k }, '', clientId)
          .then(assert.fail, function (err) {
            assert.ok(err.message.indexOf('missing uid') > -1);
          });
      });

      it('fails if rid is missing', function () {
        return RelierKeys.deriveRelierKeys({ kA: k, kB: k }, uid, '')
          .then(assert.fail, function (err) {
            assert.ok(err.message.indexOf('missing rid') > -1);
          });
      });
    });

    describe('generateDerivedKey', function () {
      it('correctly derives a known test value of `kAr`', function () {
        var options = {
          clientId: clientId,
          inputKey: k,
          keyClassTag: 'kAr',
          uid: uid
        };
        return RelierKeys.generateDerivedKey(options)
          .then(function (kAr) {
            assert.equal(kAr.kid, kArID);
            assert.equal(kAr.k, kArBytes);
            assert.equal(kAr.kty, 'oct');
            assert.equal(kAr.uid, uid);
            assert.equal(kAr.rid, clientId);
          });
      });

      it('correctly derives a known test value of `kBr`', function () {
        var options = {
          clientId: clientId,
          inputKey: k,
          keyClassTag: 'kBr',
          uid: uid
        };
        return RelierKeys.generateDerivedKey(options)
          .then(function (kBr) {
            assert.equal(kBr.kid, kBrID);
            assert.equal(kBr.k, kBrBytes);
            assert.equal(kBr.kty, 'oct');
            assert.equal(kBr.uid, uid);
            assert.equal(kBr.rid, clientId);
          });
      });
    });
  });
});

