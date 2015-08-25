/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'sinon',
  'lib/promise',
  'lib/constants',
  'lib/assertion',
  'lib/profile-client',
  'lib/oauth-client',
  'lib/fxa-client',
  'lib/auth-errors',
  'lib/profile-errors',
  'lib/marketing-email-client',
  'models/account',
  'models/oauth-token',
  'models/reliers/relier'
],
function (chai, sinon, p, Constants, Assertion, ProfileClient,
    OAuthClient, FxaClientWrapper, AuthErrors, ProfileErrors,
    MarketingEmailClient, Account, OAuthToken, Relier) {
  'use strict';

  var assert = chai.assert;

  describe('models/account', function () {
    var account;
    var assertion;
    var oAuthClient;
    var profileClient;
    var relier;
    var fxaClient;
    var marketingEmailClient;
    var EMAIL = 'user@example.domain';
    var PASSWORD = 'password';
    var UID = '6d940dd41e636cc156074109b8092f96';
    var URL = 'http://127.0.0.1:1112/avatar/example.jpg';
    var PNG_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';
    var CLIENT_ID = 'client_id';
    var SESSION_TOKEN = 'abc123';
    var PROFILE_CLIENT_METHODS = [
      'getAvatar',
      'getAvatars',
      'postAvatar',
      'deleteAvatar',
      'uploadAvatar'
    ];

    beforeEach(function () {
      assertion = new Assertion();
      oAuthClient = new OAuthClient();
      profileClient = new ProfileClient();
      fxaClient = new FxaClientWrapper();
      marketingEmailClient = new MarketingEmailClient();
      relier = new Relier();

      account = new Account({
        oAuthClient: oAuthClient,
        assertion: assertion,
        profileClient: profileClient,
        fxaClient: fxaClient,
        marketingEmailClient: marketingEmailClient,
        oAuthClientId: CLIENT_ID,
        accountData: {
          email: EMAIL,
          uid: UID
        }
      });
    });

    afterEach(function () {
      account = null;
    });

    describe('fetch', function () {

      it('does not fetch without a sessionToken', function () {
        return account.fetch()
          .then(function () {
            assert.isUndefined(account.get('verified'));
            assert.isUndefined(account.get('accessToken'));
            assert.isUndefined(account.get('sessionToken'));
          });
      });

      it('sets verified state', function () {
        account.set('sessionToken', SESSION_TOKEN);
        sinon.stub(fxaClient, 'recoveryEmailStatus', function () {
          return p({ verified: true });
        });

        return account.fetch()
          .then(function () {
            assert.isTrue(account.get('verified'), 'verified');
          });
      });

      it('fails to set verified state with error', function () {
        account.set('sessionToken', SESSION_TOKEN);
        sinon.stub(fxaClient, 'recoveryEmailStatus', function () {
          return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
        });
        return account.fetch()
          .then(function () {
            assert.isTrue(fxaClient.recoveryEmailStatus.calledWith(SESSION_TOKEN));
            assert.isUndefined(account.get('verified'));
          });
      });

      it('fails to fetch with other errors', function () {
        account.set('sessionToken', SESSION_TOKEN);
        sinon.stub(fxaClient, 'recoveryEmailStatus', function () {
          return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
        });
        return account.fetch()
          .then(function () {
            assert.isUndefined(account.get('verified'));
          });
      });

    });

    describe('isVerified', function () {
      it('isVerified returns false if account is unverified', function () {
        account.set('sessionToken', SESSION_TOKEN);
        sinon.stub(fxaClient, 'recoveryEmailStatus', function () {
          return p({ verified: false });
        });

        return account.isVerified()
          .then(function (isVerified) {
            assert.isTrue(fxaClient.recoveryEmailStatus.calledWith(SESSION_TOKEN));
            assert.isFalse(isVerified);
          });
      });

      it('isVerified fails if an error occurs', function () {
        account.set('sessionToken', SESSION_TOKEN);
        sinon.stub(fxaClient, 'recoveryEmailStatus', function () {
          return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
        });

        return account.isVerified()
          .then(assert.fail,
            function (err) {
              assert.isTrue(fxaClient.recoveryEmailStatus.calledWith(SESSION_TOKEN));
              assert.isTrue(AuthErrors.is(err, 'UNKNOWN_ACCOUNT'));
            });
      });

      it('isVerified returns true', function () {
        account.set('sessionToken', SESSION_TOKEN);
        sinon.stub(fxaClient, 'recoveryEmailStatus', function () {
          return p({ verified: true });
        });
        return account.isVerified()
          .then(function (isVerified) {
            assert.isTrue(fxaClient.recoveryEmailStatus.calledWith(SESSION_TOKEN));
            assert.isTrue(isVerified);
          });
      });
    });

    describe('signIn', function () {
      it('sign in with password, unverified', function () {
        account.set('password', PASSWORD);
        sinon.stub(fxaClient, 'signIn', function () {
          return p({ sessionToken: SESSION_TOKEN, verified: false });
        });
        sinon.stub(fxaClient, 'signUpResend', function () {
          return p();
        });

        return account.signIn(relier, { resume: 'resume token' })
          .then(function () {
            assert.isFalse(account.get('verified'));
            assert.equal(account.get('sessionToken'), SESSION_TOKEN);
            assert.isTrue(fxaClient.signIn.calledWith(EMAIL, PASSWORD, relier));
            assert.isTrue(fxaClient.signUpResend.calledWith(
              relier,
              SESSION_TOKEN,
              {
                resume: 'resume token'
              }
            ));
          });
      });

      it('sign in with password, verified', function () {
        account.set('password', PASSWORD);
        sinon.stub(fxaClient, 'signIn', function () {
          return p({ sessionToken: SESSION_TOKEN, verified: true });
        });

        return account.signIn(relier)
          .then(function () {
            assert.isTrue(account.get('verified'));
            assert.equal(account.get('sessionToken'), SESSION_TOKEN);
            assert.isTrue(fxaClient.signIn.calledWith(EMAIL, PASSWORD, relier));
          });
      });

      it('sign in with password error', function () {
        account.set('password', 'password');
        sinon.stub(fxaClient, 'signIn', function () {
          return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
        });

        return account.signIn(relier)
          .then(assert.fail,
            function (err) {
              assert.isTrue(fxaClient.signIn.calledWith(EMAIL, PASSWORD, relier));
              assert.isTrue(AuthErrors.is(err, 'UNKNOWN_ACCOUNT'));
            });
      });

      it('sign in with sessionToken, unverified', function () {
        account.set('sessionToken', SESSION_TOKEN);
        sinon.stub(fxaClient, 'recoveryEmailStatus', function () {
          return p({ verified: false });
        });
        sinon.stub(fxaClient, 'signUpResend', function () {
          return p();
        });

        return account.signIn(relier)
          .then(function () {
            assert.isFalse(account.get('verified'));
            assert.isTrue(fxaClient.recoveryEmailStatus.calledWith(SESSION_TOKEN));
            assert.isTrue(fxaClient.signUpResend.calledWith(relier, SESSION_TOKEN));
          });
      });

      it('sign in with sessionToken, verified', function () {
        account.set('sessionToken', SESSION_TOKEN);
        sinon.stub(fxaClient, 'recoveryEmailStatus', function () {
          return p({ verified: true });
        });

        return account.signIn(relier)
          .then(function () {
            assert.isTrue(account.get('verified'));
            assert.isTrue(fxaClient.recoveryEmailStatus.calledWith(SESSION_TOKEN));
          });
      });

      it('sign in with sessionToken error', function () {
        account.set('sessionToken', SESSION_TOKEN);
        sinon.stub(fxaClient, 'recoveryEmailStatus', function () {
          return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
        });

        return account.signIn(relier)
          .then(assert.fail,
            function (err) {
              assert.isTrue(fxaClient.recoveryEmailStatus.calledWith(SESSION_TOKEN));
              assert.isTrue(AuthErrors.is(err, 'UNKNOWN_ACCOUNT'));
            });
      });

      it('sign in unexpected error', function () {
        account.clear('sessionToken');
        account.clear('password');

        return account.signIn(relier)
          .then(assert.fail,
            function (err) {
              assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
            });
      });
    });


    describe('signUp', function () {
      it('sign up', function () {
        account.set('password', PASSWORD);
        account.set('customizeSync', true);
        sinon.stub(fxaClient, 'signUp', function () {
          return p({ sessionToken: SESSION_TOKEN, verified: false });
        });

        return account.signUp(relier, { resume: 'resume token' })
          .then(function () {
            assert.isFalse(account.get('verified'));
            assert.equal(account.get('sessionToken'), SESSION_TOKEN);

            assert.isTrue(fxaClient.signUp.calledWith(
              EMAIL,
              PASSWORD,
              relier,
              {
                customizeSync: true,
                resume: 'resume token'
              }
            ));
          });
      });
    });

    describe('createOAuthToken', function () {
      var accessToken = 'access token';

      beforeEach(function () {
        account.set('sessionToken', SESSION_TOKEN);
        account.set('verified', true);
        sinon.stub(assertion, 'generate', function () {
          return p('assertion');
        });
        sinon.stub(oAuthClient, 'getToken', function () {
          return p({ 'access_token': accessToken });
        });
      });

      it('can fetch an oauth access token', function () {
        return account.createOAuthToken('scope')
          .then(function (token) {
            assert.equal(token.get('token'), accessToken);
            assert.isTrue(assertion.generate.calledWith(SESSION_TOKEN));
            assert.isTrue(oAuthClient.getToken.calledWith({
              client_id: CLIENT_ID, //eslint-disable-line camelcase
              scope: 'scope',
              assertion: 'assertion'
            }));
          });
      });

      it('fails to if bad assertion', function () {
        assertion.generate.restore();
        sinon.stub(assertion, 'generate', function () {
          return p.reject(AuthErrors.toError('UNAUTHORIZED'));
        });
        return account.createOAuthToken('scope')
          .then(assert.fail,
            function (err) {
              assert.isTrue(AuthErrors.is(err, 'UNAUTHORIZED'));
            });
      });

      it('fails to fetch when unauthorized', function () {
        oAuthClient.getToken.restore();
        sinon.stub(oAuthClient, 'getToken', function () {
          return p.reject(AuthErrors.toError('UNAUTHORIZED'));
        });
        return account.createOAuthToken('scope')
          .then(assert.fail,
            function (err) {
              assert.isTrue(AuthErrors.is(err, 'UNAUTHORIZED'));
            });
      });
    });

    describe('profileClient', function () {
      var accessToken = 'access token';

      beforeEach(function () {
        account.set('verified', true);
        sinon.stub(account, 'fetch', function () {
          return p();
        });
      });

      it('rejects if not verified', function () {
        account.set('verified', false);

        return account.profileClient()
          .then(assert.fail, function (err) {
            assert.isTrue(account.fetch.called);
            assert.isTrue(AuthErrors.is(err, 'UNVERIFIED_ACCOUNT'));
          });
      });


      it('has a profile client', function () {
        sinon.stub(account, 'createOAuthToken', function () {
          return p(new OAuthToken({ token: accessToken }));
        });
        return account.profileClient()
          .then(function (profileClient) {
            assert.ok(profileClient);
            assert.isTrue(account.createOAuthToken.called);
          });
      });

      it('profile client fails if not authorized', function () {
        sinon.stub(account, 'createOAuthToken', function () {
          return p.reject(ProfileErrors.toError('UNAUTHORIZED'));
        });
        return account.profileClient()
          .then(assert.fail, function (err) {
            assert.isTrue(ProfileErrors.is(err, 'UNAUTHORIZED'));
            assert.isTrue(account.createOAuthToken.called);
          });
      });
    });

    describe('with an access token', function () {
      var accessToken = 'token';
      beforeEach(function () {
        account.set('verified', true);
        account.set('accessToken', accessToken);
        sinon.stub(account, 'fetch', function () {
          return p();
        });
      });

      describe('avatars', function () {
        beforeEach(function () {
          sinon.stub(account, 'profileClient', function () {
            return p(profileClient);
          });
        });

        it('gets an avatar', function () {
          sinon.stub(profileClient, 'getAvatar', function () {
            return p({ avatar: URL, id: 'foo' });
          });
          return account.getAvatar()
            .then(function (result) {
              assert.isTrue(profileClient.getAvatar.calledWith(accessToken));
              assert.equal(result.avatar, URL);
              assert.equal(result.id, 'foo');
            });
        });

        it('gets avatars', function () {
          sinon.stub(profileClient, 'getAvatars', function () {
            return {
              avatars: [
                { id: 'foo', selected: true, url: URL },
                { id: 'bar', selected: false, url: 'barurl' }
              ]
            };
          });

          return account.getAvatars()
            .then(function (result) {
              assert.isTrue(profileClient.getAvatars.calledWith(accessToken));
              assert.ok(result.avatars);
              assert.equal(result.avatars.length, 2);
              assert.equal(result.avatars[0].url, URL);
            });
        });

        it('post an avatar url', function () {
          var IMG_URL = 'https://secure.gravatar.com/deadbeef';
          sinon.stub(profileClient, 'postAvatar', function () {
            return p();
          });

          return account.postAvatar(IMG_URL, true)
            .then(function () {
              assert.isTrue(profileClient.postAvatar.calledWith(accessToken, IMG_URL, true));
            });
        });

        it('delete an avatar', function () {
          var ID = 'deadbeef';
          sinon.stub(profileClient, 'deleteAvatar', function () {
            return p();
          });

          return account.deleteAvatar(ID)
            .then(function () {
              assert.isTrue(profileClient.deleteAvatar.calledWith(accessToken, ID));
            });
        });

        it('upload an image', function () {
          var DATA = 'image data';
          sinon.stub(profileClient, 'uploadAvatar', function () {
            return { url: URL };
          });

          return account.uploadAvatar(DATA)
            .then(function (result) {
              assert.isTrue(profileClient.uploadAvatar.calledWith(accessToken, DATA));
              assert.equal(result.url, URL);
            });
        });

      });
    });

    describe('with a valid sessionToken, without an access token', function () {
      beforeEach(function () {
        var tokens = 0;
        sinon.stub(account, 'fetch', function () {
          return p();
        });
        account.set('verified', true);

        sinon.stub(account, 'createOAuthToken', function () {
          // returns "token1" then "token2", etc.
          return p(new OAuthToken({ token: 'token' + (++tokens) }));
        });

      });

      PROFILE_CLIENT_METHODS.forEach(function (method) {
        it('retries on ' + method, function () {
          sinon.stub(profileClient, method, function () {
            return p.reject(ProfileClient.Errors.toError('UNAUTHORIZED'));
          });
          return account[method]()
            .then(
              assert.fail,
              function (err) {
                assert.isTrue(account.createOAuthToken.calledTwice);
                assert.isTrue(profileClient[method].calledTwice);
                assert.isTrue(ProfileClient.Errors.is(err, 'UNAUTHORIZED'));
                assert.isUndefined(account.get('accessToken'));
              }
            );
        });

        it('retries and succeeds on ' + method, function () {
          sinon.stub(profileClient, method, function (token) {
            if (token === 'token1') {
              return p.reject(ProfileClient.Errors.toError('UNAUTHORIZED'));
            } else {
              return p();
            }
          });
          return account[method]()
            .then(
              function () {
                assert.isTrue(account.createOAuthToken.calledTwice);
                assert.isTrue(profileClient[method].calledTwice);
                assert.equal(account.get('accessToken'), 'token2');
              }
            );
        });

        it('throws other errors on ' + method, function () {
          sinon.stub(profileClient, method, function () {
            return p.reject(ProfileClient.Errors.toError('UNKNOWN_ACCOUNT'));
          });
          return account[method]()
            .then(
              assert.fail,
              function (err) {
                assert.isTrue(ProfileClient.Errors.is(err, 'UNKNOWN_ACCOUNT'));
                assert.isTrue(account.createOAuthToken.calledOnce);
                assert.isTrue(profileClient[method].calledOnce);
                assert.equal(account.get('accessToken'), 'token1');
              }
            );
        });
      });
    });

    describe('without a valid sessionToken, without an access token', function () {
      beforeEach(function () {
        sinon.stub(account, 'fetch', function () {
          return p();
        });
        account.set('verified', true);

        sinon.stub(account, 'createOAuthToken', function () {
          return p.reject(ProfileClient.Errors.toError('UNAUTHORIZED'));
        });
      });

      PROFILE_CLIENT_METHODS.forEach(function (method) {
        it('retries on ' + method, function () {
          var spy = sinon.spy(profileClient, method);
          return account[method]()
            .then(
              assert.fail,
              function (err) {
                assert.isTrue(account.createOAuthToken.calledTwice);
                assert.isFalse(spy.called);
                assert.isTrue(ProfileClient.Errors.is(err, 'UNAUTHORIZED'));
                assert.isUndefined(account.get('accessToken'));
              }
            );
        });
      });
    });

    describe('with an unverified account', function () {
      beforeEach(function () {
        sinon.stub(account, 'profileClient', function () {
          return p.reject(AuthErrors.toError('UNVERIFIED_ACCOUNT'));
        });
      });

      PROFILE_CLIENT_METHODS.forEach(function (method) {
        it('rejects on ' + method, function () {
          sinon.spy(profileClient, method);
          return account[method]()
            .then(
              assert.fail,
              function (err) {
                assert.isTrue(account.profileClient.called);
                assert.isFalse(profileClient[method].called);
                assert.isTrue(AuthErrors.is(err, 'UNVERIFIED_ACCOUNT'));
              }
            );
        });
      });
    });


    it('isFromSync returns true in the right context', function () {
      account.set('sessionTokenContext', Constants.SESSION_TOKEN_USED_FOR_SYNC);
      assert.isTrue(account.isFromSync());
    });

    it('isFromSync returns false in the wrong context', function () {
      account.set('sessionTokenContext', 'foo');
      assert.isFalse(account.isFromSync());
    });

    it('initializes with data from the right keys', function () {
      account = new Account({
        accountData: {
          email: EMAIL,
          uid: UID,
          sessionToken: SESSION_TOKEN,
          foo: 'bar'
        }
      });

      assert.ok(account.get('email'));
      assert.isUndefined(account.get('foo'));
    });

    it('initializes with no data', function () {
      account = new Account();

      assert.isUndefined(account.get('email'));
    });

    it('toJSON returns data for the right keys', function () {
      account = new Account({
        accountData: {
          email: EMAIL,
          uid: UID,
          sessionToken: SESSION_TOKEN,
          foo: 'bar',
          password: 'password'
        },
        assertion: 'test'
      });

      var data = account.toJSON();

      assert.isUndefined(data.accountData);
      assert.isUndefined(data.assertion);
      assert.isUndefined(data.foo);
      assert.ok(data.email);
      assert.ok(data.password);
    });

    it('toPersistentJSON returns data for the right keys', function () {
      account = new Account({
        accountData: {
          email: EMAIL,
          uid: UID,
          sessionToken: SESSION_TOKEN,
          foo: 'bar',
          accessToken: 'token',
          password: 'password',
          grantedPermissions: {
            'some-client-id': ['profile:email', 'profile:uid']
          }
        },
        assertion: 'test'
      });

      var data = account.toPersistentJSON();

      assert.isUndefined(data.accountData);
      assert.isUndefined(data.assertion);
      assert.isUndefined(data.foo);
      assert.isUndefined(data.accessToken);
      assert.isUndefined(data.password);
      assert.ok(data.email);
      assert.ok(data.grantedPermissions);
      assert.equal(data.grantedPermissions['some-client-id'][0], 'profile:email');
    });

    describe('isDefault', function () {
      it('true for empty account', function () {
        assert.isTrue(new Account().isDefault());
      });

      it('true for account with data that is not in one of its allowed keys', function () {
        assert.isTrue(new Account({ assertion: 'blah' }).isDefault());
      });

      it('not true for account with data', function () {
        assert.isFalse(new Account({ email: 'a@a.com' }).isDefault());
      });
    });

    describe('isSignedIn', function () {
      it('returns `false` if the model has no sessionToken', function () {
        account.unset('sessionToken');
        return account.isSignedIn()
          .then(function (isSignedIn) {
            assert.isFalse(isSignedIn);
          });
      });

      it('returns `false` if the sessionToken is expired', function () {
        account.set('sessionToken', 'exipred token');
        sinon.stub(fxaClient, 'sessionStatus', function () {
          return p.reject(AuthErrors.toError('INVALID_TOKEN'));
        });

        return account.isSignedIn()
          .then(function (isSignedIn) {
            assert.isFalse(isSignedIn);
          });
      });

      it('returns `true` if the sessionToken is valid', function () {
        account.set('sessionToken', 'valid token');
        sinon.stub(fxaClient, 'sessionStatus', function () {
          return p();
        });

        return account.isSignedIn()
          .then(function (isSignedIn) {
            assert.isTrue(isSignedIn);
          });
      });
    });

    describe('fetchCurrentProfileImage', function () {
      it('returns profile image', function () {
        sinon.stub(account, 'getAvatar', function () {
          return p({ avatar: PNG_URL, id: 'foo' });
        });

        sinon.spy(account, 'setProfileImage');

        return account.fetchCurrentProfileImage()
          .then(function (profileImage) {
            assert.equal(profileImage.get('url'), PNG_URL);
            assert.equal(profileImage.get('id'), 'foo');
            assert.isTrue(profileImage.has('img'));
            assert.isTrue(account.get('hadProfileImageSetBefore'));
            assert.isTrue(account.setProfileImage.calledWith(profileImage));
          });
      });

      it('errors on getAvatar returns error', function () {
        sinon.stub(account, 'getAvatar', function () {
          return p.reject(ProfileErrors.toError('UNAUTHORIZED'));
        });

        return account.fetchCurrentProfileImage()
          .then(function () {
            assert.fail('Unexpected success');
          }, function (err) {
            assert.isTrue(ProfileErrors.is(err, 'UNAUTHORIZED'));
          });
      });

      it('errors on profileImage fetch returns error', function () {
        sinon.stub(account, 'getAvatar', function () {
          return p({ avatar: 'bad url', id: 'foo' });
        });

        return account.fetchCurrentProfileImage()
          .then(function () {
            assert.fail('Unexpected success');
          }, function (err) {
            assert.isTrue(ProfileErrors.is(err, 'IMAGE_LOAD_ERROR'));
          });
      });
    });

    describe('fetchProfile', function () {
      it('returns profile', function () {
        var name = 'snoopy';
        sinon.stub(account, 'getProfile', function () {
          return p({ avatar: PNG_URL, displayName: name });
        });

        sinon.spy(account, 'setProfileImage');

        return account.fetchProfile()
          .then(function () {
            assert.equal(account.get('profileImageUrl'), PNG_URL);
            assert.isTrue(account.setProfileImage.called);
            assert.equal(account.setProfileImage.args[0][0].get('url'), PNG_URL);
            assert.isTrue(account.get('hadProfileImageSetBefore'));
            assert.equal(account.get('displayName'), name);
          });
      });
    });

    describe('permissions', function () {
      it('saves permissions', function () {
        var clientId = 'blah';
        var scope = ['profile:email', 'profile:uid'];

        assert.isTrue(account.hasGrantedPermissions(clientId), 'no scopes requested');
        assert.isFalse(account.hasGrantedPermissions(clientId, ['profile:email']));

        account.saveGrantedPermissions(clientId, scope);

        assert.isTrue(account.hasGrantedPermissions(clientId, scope));
        assert.isTrue(account.hasGrantedPermissions(clientId, ['profile:email']));
        assert.isTrue(account.hasGrantedPermissions(clientId, ['profile:uid']));

        assert.isFalse(account.hasGrantedPermissions(clientId, ['profile:avatar']));

        assert.deepEqual(account.ungrantedPermissions(clientId, ['profile:avatar', 'profile:uid', 'profile:email', 'todolist:write']),
          ['profile:avatar', 'todolist:write']);
      });
    });

    describe('getMarketingEmailPrefs', function () {
      it('returns a MarketingEmailPrefs instance', function () {
        assert.ok(account.getMarketingEmailPrefs());
      });
    });

    describe('changePassword', function () {
      it('returns `INCORRECT_PASSWORD` error if old password is incorrect (event if passwords are the same)', function () {
        sinon.stub(fxaClient, 'checkPassword', function () {
          return p.reject(AuthErrors.toError('INCORRECT_PASSWORD'));
        });

        return account.changePassword('bad_password', 'bad_password', relier)
          .then(assert.fail, function (err) {
            assert.isTrue(AuthErrors.is(err, 'INCORRECT_PASSWORD'));
          });
      });

      it('returns `PASSWORD_MUST_BE_DIFFERENT` error if both passwords are the same and the first password is correct', function () {
        sinon.stub(fxaClient, 'checkPassword', function () {
          return p();
        });

        return account.changePassword('password', 'password', relier)
          .then(assert.fail, function (err) {
            assert.ok(AuthErrors.is(err, 'PASSWORDS_MUST_BE_DIFFERENT'));
          });
      });

      it('changes from old to new password', function () {
        var oldPassword = 'password';
        var newPassword = 'new_password';
        account.set('sessionTokenContext', 'foo');

        sinon.stub(fxaClient, 'checkPassword', function () {
          return p();
        });

        sinon.stub(fxaClient, 'changePassword', function () {
          return p();
        });

        sinon.stub(fxaClient, 'signIn', function () {
          return p({});
        });


        return account.changePassword(oldPassword, newPassword, relier)
          .then(function () {
            assert.isTrue(fxaClient.checkPassword.calledWith(
              EMAIL, oldPassword));
            assert.isTrue(fxaClient.changePassword.calledWith(
              EMAIL, oldPassword, newPassword));
            assert.isTrue(fxaClient.signIn.calledWith(
              EMAIL,
              newPassword,
              relier,
              {
                reason: fxaClient.SIGNIN_REASON.PASSWORD_CHANGE,
                sessionTokenContext: 'foo'
              }
            ));
          });
      });
    });

    describe('completePasswordReset', function () {
      it('completes the password reset, signs the user in', function () {
        account.set('email', EMAIL);
        account.set('password', PASSWORD);
        var token = 'token';
        var code = 'code';

        sinon.stub(fxaClient, 'signIn', function () {
          return p({
            verified: true
          });
        });
        sinon.stub(fxaClient, 'completePasswordReset', function () {
          return p(true);
        });

        return account.completePasswordReset(token, code, relier)
          .then(function () {
            assert.isTrue(fxaClient.completePasswordReset.calledWith(
              EMAIL, PASSWORD, token, code));
            assert.isTrue(fxaClient.signIn.calledWith(
              EMAIL,
              PASSWORD,
              relier,
              {
                reason: fxaClient.SIGNIN_REASON.PASSWORD_RESET
              }
            ));
            // ensure data returned from fxaClient.signIn updates the account
            assert.isTrue(account.get('verified'));
          });
      });
    });
  });
});
