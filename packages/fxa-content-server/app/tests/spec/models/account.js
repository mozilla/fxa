/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


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
  'models/account'
],
function (chai, sinon, p, Constants, Assertion, ProfileClient,
    OAuthClient, FxaClientWrapper, AuthErrors, ProfileErrors, Account) {
  var assert = chai.assert;

  describe('models/account', function () {
    var account;
    var assertion;
    var oAuthClient;
    var profileClient;
    var fxaClient;
    var EMAIL = 'user@example.domain';
    var UID = '6d940dd41e636cc156074109b8092f96';
    var URL = 'http://127.0.0.1:1112/avatar/example.jpg';
    var PNG_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';
    var CLIENT_ID = 'client_id';
    var SESSION_TOKEN = 'abc123';

    beforeEach(function () {
      assertion = new Assertion();
      oAuthClient = new OAuthClient();
      profileClient = new ProfileClient();
      fxaClient = new FxaClientWrapper();

      account = new Account({
        oAuthClient: oAuthClient,
        assertion: assertion,
        profileClient: profileClient,
        fxaClient: fxaClient,
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

      it('fetches access token and sets verified state', function () {
        account.set('sessionToken', SESSION_TOKEN);
        sinon.stub(fxaClient, 'recoveryEmailStatus', function () {
          return p({ verified: true });
        });
        sinon.stub(assertion, 'generate', function () {
          return p('assertion');
        });
        sinon.stub(oAuthClient, 'getToken', function () {
          return p({ 'access_token': 'access token' });
        });

        return account.fetch()
          .then(function () {
            assert.isTrue(assertion.generate.calledWith(SESSION_TOKEN));
            assert.isTrue(oAuthClient.getToken.calledWith({
              'client_id': CLIENT_ID,
              assertion: 'assertion',
              scope: 'profile:write'
            }));

            assert.isTrue(account.get('verified'));
            assert.equal(account.get('accessToken'), 'access token');
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

      it('fails to fetch access token with an unverified account', function () {
        account.set('sessionToken', SESSION_TOKEN);
        sinon.stub(fxaClient, 'recoveryEmailStatus', function () {
          return p({ verified: false });
        });

        return account.fetch()
          .then(function () {
            assert.isFalse(account.get('verified'));
            assert.isUndefined(account.get('accessToken'));
          });
      });

      it('fails to fetch with other errors', function () {
        account.set('sessionToken', SESSION_TOKEN);
        sinon.stub(fxaClient, 'recoveryEmailStatus', function () {
          return p({ verified: true });
        });
        sinon.stub(assertion, 'generate', function () {
          return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
        });
        return account.fetch()
          .then(function () {
            assert.isUndefined(account.get('accessToken'));
            assert.isTrue(account.get('verified'));
          });
      });

    });

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

    describe('with an access token', function () {
      var accessToken = 'access token';

      beforeEach(function () {
        account.set('sessionToken', SESSION_TOKEN);
        sinon.stub(fxaClient, 'recoveryEmailStatus', function () {
          return p({ verified: true });
        });
        sinon.stub(assertion, 'generate', function () {
          return p('assertion');
        });
        sinon.stub(oAuthClient, 'getToken', function () {
          return p({ 'access_token': accessToken });
        });
      });

      it('has a profile client', function () {
        return account.profileClient()
          .then(function (profileClient) {
            assert.ok(profileClient);
          });
      });

      it('isVerified returns true', function () {
        return account.isVerified()
          .then(function (isVerified) {
            assert.isTrue(isVerified);
          });
      });

      describe('avatars', function () {
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

    describe('without an access token', function () {
      beforeEach(function () {
        account.set('sessionToken', SESSION_TOKEN);
        sinon.stub(assertion, 'generate', function () {
          return p('assertion');
        });
        sinon.stub(fxaClient, 'recoveryEmailStatus', function () {
          return p({ verified: true });
        });
        sinon.stub(oAuthClient, 'getToken', function () {
          return p.reject(ProfileClient.Errors.toError('UNVERIFIED_ACCOUNT'));
        });
      });

      ['getAvatar', 'getAvatars', 'postAvatar', 'deleteAvatar', 'uploadAvatar']
      .forEach(function (method) {
        it('fails on ' + method, function () {
          return account[method]()
            .then(
              assert.fail,
              function (err) {
                assert.isTrue(ProfileClient.Errors.is(err, 'UNAUTHORIZED'));
              }
            );
        });
      });
    });

    it('isFromSync returns true in the right context', function () {
      account.set('sessionTokenContext', Constants.FX_DESKTOP_CONTEXT);
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
          password: 'password'
        },
        assertion: 'test'
      });

      var data = account.toPersistentJSON();

      assert.isUndefined(data.accountData);
      assert.isUndefined(data.assertion);
      assert.isUndefined(data.foo);
      assert.isUndefined(data.password);
      assert.ok(data.email);
    });

    describe('isEmpty', function () {
      it('true for empty account', function () {
        assert.isTrue(new Account().isEmpty());
      });

      it('true for account with data that is not in one of its allowed keys', function () {
        assert.isTrue(new Account({ assertion: 'blah' }).isEmpty());
      });

      it('not true for account with data', function () {
        assert.isFalse(new Account({ email: 'a@a.com' }).isEmpty());
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

        return account.fetchCurrentProfileImage()
          .then(function (profileImage) {
            assert.equal(profileImage.get('url'), PNG_URL);
            assert.equal(profileImage.get('id'), 'foo');
            assert.isTrue(profileImage.has('img'));
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

  });
});
