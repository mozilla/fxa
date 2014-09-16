/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'underscore',
  'jquery',
  'p-promise',
  'sinon',
  'lib/session',
  'lib/assertion',
  'lib/constants',
  'lib/profile',
  'lib/profile-client',
  'lib/oauth-client',
  'lib/auth-errors'
],
function (chai, _, $, p, sinon, Session, Assertion, Constants, Profile, ProfileClient, OAuthClient, AuthErrors) {
  var assert = chai.assert;

  // These URLs don't depend on our actual configuration; the servers are mocked out.
  var PROFILE_URL = 'http://127.0.0.1:1111';
  var OAUTH_URL = 'http://127.0.0.1:9010';
  var EMAIL = 'user@example.domain';
  var UID = '6d940dd41e636cc156074109b8092f96';
  var URL = 'http://127.0.0.1:1112/avatar/example.jpg';

  describe('lib/profile', function () {
    var client, server, assertion, oauthClient, profileClient;

    describe('getting a token', function () {
      beforeEach(function () {
        Session.clear();

        Session.set('config', {
          oauthClientId: 'client_id',
          oauthUrl: OAUTH_URL,
          profileUrl: PROFILE_URL
        });

        assertion = new Assertion();

        oauthClient = new OAuthClient({
          oauthUrl: OAUTH_URL
        });

        client = new Profile({
          config: Session.config,
          assertion: assertion,
          oauthClient: oauthClient
        });
      });

      afterEach(function () {
        Session.clear();
      });

      it('gets a token and profile server client ', function () {
        sinon.stub(client._assertion, 'generate', function (url) {
          assert.equal(url, OAUTH_URL);
          return p('assertion');
        });

        sinon.stub(client._oauthClient, 'getToken', function (params) {
          /* jshint camelcase: false */
          assert.equal(params.assertion, 'assertion');
          return p({
            access_token: 'ohhi'
          });
        });

        return client._getClientAsync()
          .then(function () {
            assert.equal(client._client.token, 'ohhi');
            assert.equal(client._client.profileUrl, PROFILE_URL);
          });
      });

    });


    describe('client API', function () {
      beforeEach(function () {
        var TOKEN = 'mocked';

        server = sinon.fakeServer.create();
        server.autoRespond = true;

        profileClient = new ProfileClient({
          token: TOKEN,
          profileUrl: PROFILE_URL
        });

        client = new Profile({
          profileClient: profileClient
        });

      });

      afterEach(function () {
        server.restore();
        client = null;
      });

      describe('getProfile', function () {
        it('normally responds with profile', function () {
          sinon.stub(profileClient, 'getProfile', function () {
            return {
              uid: UID,
              email: EMAIL
            };
          });

          return client.getProfile()
            .then(function (result) {
              assert.ok(result);
              assert.equal(result.uid, UID);
              assert.equal(result.email, EMAIL);
            });
        });

        it('converts returned errors to Profile server error objects', function () {

          sinon.stub(profileClient, 'getProfile', function () {
            throw {
              errno: Profile.Errors.toCode('UNAUTHORIZED'),
              code: 403
            };
          });

          return client.getProfile()
            .then(function (result) {
              assert.fail('unexpected success');
            }, function (err) {
              assert.isTrue(Profile.Errors.is(err, 'UNAUTHORIZED'));
            });
        });
      });

      describe('getAvatar', function () {
        it('normally responds with avatar', function () {
          sinon.stub(profileClient, 'getAvatar', function () {
            return {
              'avatar': URL,
              'id': 'foo'
            };
          });

          return client.getAvatar()
            .then(function (result) {
              assert.ok(result);
              assert.equal(result.avatar, URL);
              assert.equal(result.id, 'foo');
            });
        });
      });

      describe('getAvatars', function () {
        it('normally responds with avatar', function () {
          sinon.stub(profileClient, 'getAvatars', function () {
            return {
              avatars: [
                { id: 'foo', selected: true, url: URL },
                { id: 'bar', selected: false, url: 'barurl' }
              ]
            };
          });

          return client.getAvatars()
            .then(function (result) {
              assert.ok(result.avatars);
              assert.equal(result.avatars.length, 2);
              assert.equal(result.avatars[0].url, URL);
            });
        });
      });

      describe('postAvatar', function () {
        it('post an avatar url', function () {
          var IMG_URL = 'https://secure.gravatar.com/deadbeef';
          sinon.stub(profileClient, 'postAvatar', function (url, setDefault) {
            assert.equal(url, IMG_URL);
            assert.isTrue(setDefault);
          });

          return client.postAvatar(IMG_URL, true);
        });
      });

      describe('deleteAvatar', function () {
        it('delete an avatar url', function () {
          var ID = 'deadbeef';
          sinon.stub(profileClient, 'deleteAvatar', function (id) {
            assert.equal(id, ID);
          });

          return client.deleteAvatar(ID);
        });
      });

      describe('uploadAvatar', function () {
        it('upload an image', function () {
          var DATA = 'image data';
          sinon.stub(profileClient, 'uploadAvatar', function (data) {
            assert.equal(data, DATA);
            return { url: URL };
          });

          return client.uploadAvatar(DATA)
            .then(function (result) {
              assert.equal(result.url, URL);
            });
        });
      });

    });

  });
});


