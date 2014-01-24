/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'mocha',
  'chai',
  'jquery',
  '../../mocks/channel',
  'lib/session',
  'lib/fxa-client'
],
function (mocha, chai, $, ChannelMock, Session, FxaClientWrapper) {
  /*global beforeEach, describe, it*/
  var assert = chai.assert;
  var email;
  var password = 'password';
  var client;
  var channelMock;


  describe('lib/fxa-client', function () {
    beforeEach(function () {
      channelMock = new ChannelMock();
      Session.clear();
      Session.set('channel', channelMock);
      client = new FxaClientWrapper();
      email = 'testuser' + Math.random() + '@testuser.com';
    });

    afterEach(function () {
      Session.clear();
      channelMock = null;
    });

    describe('signUp', function () {
      it('signs up a user with email/password', function (done) {
        client.signUp(email, password)
          .then(function () {
            assert.equal(channelMock.message, 'login');
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
            assert.equal(channelMock.message, 'login');
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
            // positive test to ensure success case has an assertion
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
            // positive test to ensure success case has an assertion
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
            // user is automatically re-authenticated with their new password
            assert.equal(channelMock.message, 'login');
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
          .then(null, function (err) {
            // this test is necessary because errors in deleteAccount
            // should not be propagated to the final done's error
            // handler
            assert.fail('unexpected failure: ' + err.message);
            done();
          })
          .then(function () {
            return client.signIn(email, password);
          })
          .then(function () {
            assert.fail('should not be able to signin after account deletion');
            done();
          }, function (err) {
            // positive test to ensure sign in failure case has an assertion
            assert.isTrue(true);
            done();
          });
      });
    });

  });
});

