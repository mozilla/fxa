/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'mocha',
  'chai',
  'jquery',
  '../../mocks/channel',
  '../../lib/helpers',
  'lib/session',
  'lib/fxa-client',
  'lib/auth-errors'
],
// FxaClientWrapper is the object that is used in
// fxa-content-server views. It wraps FxaClient to
// take care of some app-specific housekeeping.
function (mocha, chai, $, ChannelMock, testHelpers,
              Session, FxaClientWrapper, AuthErrors) {
  /*global beforeEach, afterEach, describe, it*/
  var assert = chai.assert;
  var email;
  var password = 'password';
  var client;
  var realClient;
  var channelMock;


  describe('lib/fxa-client', function () {
    beforeEach(function (done) {
      channelMock = new ChannelMock();
      Session.clear();
      Session.set('channel', channelMock);
      email = 'testuser' + Math.random() + '@testuser.com';

      client = new FxaClientWrapper({
        language: 'it-CH'
      });
      client._getClientAsync()
              .then(function (_realClient) {
                realClient = _realClient;
                // create spies that can be used to check
                // parameters that are passed to the FxaClient
                testHelpers.addFxaClientSpy(realClient);
                done();
              });
    });

    afterEach(function () {
      Session.clear();
      channelMock = null;

      // return the client to its original state.
      testHelpers.removeFxaClientSpy(realClient);
    });

    describe('signUp/signUpResend', function () {
      it('signUp signs up a user with email/password', function (done) {
        Session.set('service', 'sync');
        Session.set('redirectTo', 'https://sync.firefox.com');

        client.signUp(email, password)
          .then(function () {
            assert.equal(channelMock.message, 'login');
            assert.isUndefined(channelMock.data.customizeSync);

            assert.isTrue(realClient.signUp.calledWith(email, password, {
              keys: true,
              service: 'sync',
              redirectTo: 'https://sync.firefox.com',
              lang: 'it-CH'
            }));

            done();
          })
          .then(null, function (err) {
            assert.fail(err);
            done();
          });
      });

      it('informs browser of customizeSync option', function (done) {
        client.signUp(email, password, true)
          .then(function () {
            assert.isTrue(channelMock.data.customizeSync);

            done();
          })
          .then(null, function (err) {
            assert.fail(err);
            done();
          });
      });

      it('signUpResend resends the validation email', function (done) {
        Session.set('service', 'sync');
        Session.set('redirectTo', 'https://sync.firefox.com');

        client.signUp(email, password)
          .then(function () {
            return client.signUpResend();
          })
          .then(function () {
            assert.isTrue(
                realClient.recoveryEmailResendCode.calledWith(
                    Session.sessionToken,
                    {
                      service: 'sync',
                      redirectTo: 'https://sync.firefox.com',
                      lang: 'it-CH'
                    }
                ));

            done();
          })
          .then(null, function (err) {
            assert.fail(err);
            done();
          });
      });

      it('signUp existing user attempts to sign the user in', function (done) {
        client.signUp(email, password)
          .then(function () {
            return client.signUp(email, password);
          })
          .then(function () {
            assert.isTrue(realClient.signIn.called);
            done();
          })
          .then(null, function (err) {
            assert.fail(err);
            done();
          });
      });

      it('signUp existing user with incorrect password returns ' +
              'incorrect password error', function (done) {
        client.signUp(email, password)
          .then(function () {
            return client.signUp(email, 'incorrect');
          })
          .then(function () {
            assert.fail('incorrect password should not lead to success');
            done();
          })
          .then(null, function (err) {
            assert.isTrue(AuthErrors.is(err, 'INCORRECT_PASSWORD'));
            done();
          });
      });

    });

    describe('signIn', function () {
      it('signin with unknown user should call errorback', function (done) {
        client.signIn('unknown@unknown.com', 'password')
          .then(function (info) {
            assert.fail('unknown user cannot sign in');
            done();
          }, function (err) {
            assert.isTrue(true);
            done();
          });
      });

      it('signs a user in with email/password', function (done) {
        client.signUp(email, password)
          .then(function () {
            return client.signIn(email, password);
          })
          .then(function () {
            assert.equal(channelMock.message, 'login');
            assert.isUndefined(channelMock.data.customizeSync);
            done();
          }, function (err) {
            assert.fail(err);
            done();
          });
      });

      it('informs browser of customizeSync option', function (done) {
        client.signUp(email, password)
          .then(function () {
            return client.signIn(email, password, true);
          })
          .then(function () {
            assert.equal(channelMock.message, 'login');
            assert.isTrue(channelMock.data.customizeSync);
            done();
          }, function (err) {
            assert.fail(err);
            done();
          });
      });
    });

    describe('passwordReset/passwordResetResend', function () {
      it('requests a password reset', function (done) {
        client.signUp(email, password)
          .then(function () {
            Session.set('service', 'sync');
            Session.set('redirectTo', 'https://sync.firefox.com');
            return client.passwordReset(email);
          })
          .then(function () {
            assert.isTrue(
                realClient.passwordForgotSendCode.calledWith(
                    email,
                    {
                      service: 'sync',
                      redirectTo: 'https://sync.firefox.com',
                      lang: 'it-CH'
                    }
                ));
            return client.passwordResetResend();
          })
          .then(function () {
            assert.isTrue(
                realClient.passwordForgotResendCode.calledWith(
                    email,
                    Session.passwordForgotToken,
                    {
                      service: 'sync',
                      redirectTo: 'https://sync.firefox.com',
                      lang: 'it-CH'
                    }
                ));
            done();
          })
          .then(null, function (err) {
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
          }, function () {
            // positive test to ensure sign in failure case has an assertion
            assert.isTrue(true);
            done();
          });
      });
    });
  });
});

