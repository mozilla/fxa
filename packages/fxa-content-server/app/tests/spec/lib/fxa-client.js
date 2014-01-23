/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'mocha',
  'chai',
  'jquery',
  'lib/fxa-client'
],
function (mocha, chai, $, FxaClientWrapper) {
  /*global beforeEach, describe, it*/
  var assert = chai.assert;
  var email;
  var password = 'password';
  var client;

  describe('lib/fxa-client', function () {
    beforeEach(function () {
      client = new FxaClientWrapper();
      email = 'testuser' + Math.random() + '@testuser.com';
    });

    describe('signUp', function () {
      it('signs up a user with email/password', function (done) {
        client.signUp(email, password)
          .then(function () {
            assert.isTrue(true);
            done();
          }, function (err) {
            assert.fail(err);
            done();
          });
      });
    });

    describe('signIn', function () {
      it('signs a user in with email/password', function (done) {
        client.signUp(email, password)
          .then(function () {
            return client.signIn(email, password);
          })
          .then(function () {
            assert.isTrue(true);
            done();
          }, function (err) {
            assert.fail(err);
            done();
          });
      });
    });

    describe('verifyCode', function () {
    });

    describe('requestPasswordReset', function () {
      it('requests a password reset', function (done) {
        client.signUp(email, password)
          .then(function () {
            return client.signIn(email, password);
          })
          .then(function () {
            return client.requestPasswordReset(email);
          })
          .then(function () {
            assert.isTrue(true);
            done();
          }, function (err) {
            assert.fail(err);
            done();
          });
      });
    });

    describe('completePasswordReset', function () {
    });

    describe('signOut', function () {
      it('signs the user out', function (done) {
        client.signUp(email, password)
          .then(function () {
            return client.signOut();
          })
          .then(function () {
            assert.isTrue(true);
            done();
          }, function (err) {
            assert.fail(err);
            done();
          });
      });
    });

    describe('changePassword', function () {
      it('changes the user\'s password', function (done) {
        client.signUp(email, password)
          .then(function () {
            return client.changePassword(email, password, 'new_password');
          })
          .then(function () {
            assert.isTrue(true);
            done();
          }, function (err) {
            assert.fail(err);
            done();
          });
      });
    });

    describe('deleteAccount', function () {
      it('deletes the user\'s account', function (done) {
        client.signUp(email, password)
          .then(function () {
            return client.deleteAccount(email, password);
          })
          .then(function () {
            return client.signIn(email, password);
          }, function(err) {
            assert.fail('unexpected failure: ' + err.message);
            done();
          })
          .then(function () {
            assert.fail(err, 'client should not be able to sign in after account is deleted');
            done();
          }, function (err) {
            assert.isTrue(true);
            done();
          });
      });
    });

  });
});

