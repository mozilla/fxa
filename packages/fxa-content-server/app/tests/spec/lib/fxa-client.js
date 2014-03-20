/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
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
function (chai, $, ChannelMock, testHelpers,
              Session, FxaClientWrapper, AuthErrors) {
  /*global beforeEach, afterEach, describe, it*/
  var assert = chai.assert;
  var email;
  var password = 'password';
  var client;
  var realClient;
  var channelMock;

  function trim(str) {
    return str && str.replace(/^\s+|\s+$/g, '');
  }

  describe('lib/fxa-client', function () {
    beforeEach(function () {
      channelMock = new ChannelMock();
      Session.clear();
      Session.set('channel', channelMock);
      email = ' testuser' + Math.random() + '@testuser.com ';

      client = new FxaClientWrapper({
        language: 'it-CH'
      });
      return client._getClientAsync()
              .then(function (_realClient) {
                realClient = _realClient;
                // create spies that can be used to check
                // parameters that are passed to the FxaClient
                testHelpers.addFxaClientSpy(realClient);
              });
    });

    afterEach(function () {
      Session.clear();
      channelMock = null;

      // return the client to its original state.
      testHelpers.removeFxaClientSpy(realClient);
    });

    describe('signUp/signUpResend', function () {
      it('signUp signs up a user with email/password', function () {
        Session.set('service', 'sync');
        Session.set('redirectTo', 'https://sync.firefox.com');

        return client.signUp(email, password)
          .then(function () {
            assert.equal(channelMock.message, 'login');
            assert.isUndefined(channelMock.data.customizeSync);

            assert.isTrue(realClient.signUp.calledWith(trim(email), password, {
              keys: true,
              service: 'sync',
              redirectTo: 'https://sync.firefox.com',
              lang: 'it-CH'
            }));
          });
      });

      it('informs browser of customizeSync option', function () {
        return client.signUp(email, password, { customizeSync: true })
          .then(function () {
            assert.isTrue(channelMock.data.customizeSync);
          });
      });

      it('signUpResend resends the validation email', function () {
        Session.set('service', 'sync');
        Session.set('redirectTo', 'https://sync.firefox.com');

        return client.signUp(email, password)
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
          });
      });

      it('signUp existing user attempts to sign the user in', function () {
        return client.signUp(email, password)
          .then(function () {
            return client.signUp(email, password);
          })
          .then(function () {
            assert.isTrue(realClient.signIn.called);
          });
      });

      it('signUp existing verified user with incorrect password returns ' +
              'incorrect password error', function () {
        return client.signUp(email, password, { preVerified: true })
          .then(function () {
            return client.signUp(email, 'incorrect');
          })
          .then(function () {
            throw new Error('incorrect password should not lead to success');
          }, function (err) {
            assert.isTrue(AuthErrors.is(err, 'INCORRECT_PASSWORD'));
          });
      });

      it('signUp existing unverified user with different password signs ' +
              'user up again', function () {
        return client.signUp(email, password)
          .then(function () {
            return client.signUp(email, 'different_password');
          })
          .then(function () {
            assert.isTrue(realClient.signUp.called);
            assert.isTrue(realClient.signIn.called);
          });
      });

    });

    describe('signIn', function () {
      it('signin with unknown user should call errorback', function () {
        return client.signIn('unknown@unknown.com', 'password')
          .then(function (info) {
            assert.fail('unknown user cannot sign in');
          }, function (err) {
            assert.isTrue(true);
          });
      });

      it('signs a user in with email/password', function () {
        return client.signUp(email, password)
          .then(function () {
            return client.signIn(email, password);
          })
          .then(function () {
            assert.isTrue(realClient.signIn.calledWith(trim(email)));
            assert.equal(channelMock.message, 'login');
            assert.isUndefined(channelMock.data.customizeSync);
          });
      });

      it('informs browser of customizeSync option', function () {
        return client.signUp(email, password)
          .then(function () {
            return client.signIn(email, password, true);
          })
          .then(function () {
            assert.equal(channelMock.message, 'login');
            assert.isTrue(channelMock.data.customizeSync);
          });
      });

    });

    describe('passwordReset/passwordResetResend', function () {
      it('requests a password reset', function () {
        return client.signUp(email, password)
          .then(function () {
            Session.set('service', 'sync');
            Session.set('redirectTo', 'https://sync.firefox.com');
            return client.passwordReset(email);
          })
          .then(function () {
            assert.isTrue(
                realClient.passwordForgotSendCode.calledWith(
                    trim(email),
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
                    trim(email),
                    Session.passwordForgotToken,
                    {
                      service: 'sync',
                      redirectTo: 'https://sync.firefox.com',
                      lang: 'it-CH'
                    }
                ));
          });
      });
    });

    describe('completePasswordReset', function () {
    });

    describe('signOut', function () {
      it('signs the user out', function () {
        return client.signUp(email, password)
          .then(function () {
            return client.signOut();
          });
      });

      it('resolves to success on XHR failure', function () {
        return client.signUp(email, password)
          .then(function () {
            return client.signOut();
          })
          .then(function () {
            // user has no session, this will cause an XHR error.
            return client.signOut();
          });
      });
    });

    describe('changePassword', function () {
      it('changes the user\'s password', function () {
        return client.signUp(email, password, {preVerified: true})
          .then(function () {
            return client.changePassword(email, password, 'new_password');
          })
          .then(function () {
            assert.isTrue(realClient.passwordChange.calledWith(trim(email)));
            // user is automatically re-authenticated with their new password
            assert.equal(channelMock.message, 'login');
          });
      });
    });

    describe('deleteAccount', function () {
      it('deletes the user\'s account', function () {
        return client.signUp(email, password)
          .then(function () {
            return client.deleteAccount(email, password);
          })
          .then(null, function (err) {
            assert.isTrue(realClient.accountDestroy.calledWith(trim(email)));
            // this test is necessary because errors in deleteAccount
            // should not be propagated to the final done's error
            // handler
            done(new Error('unexpected failure: ' + err.message));
          })
          .then(function () {
            return client.signIn(email, password);
          })
          .then(function () {
            throw new Error('should not be able to signin after account deletion');
          }, function () {
            // positive test to ensure sign in failure case has an assertion
            assert.isTrue(true);
          });
      });
    });
  });
});

