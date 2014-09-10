/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'jquery',
  'sinon',
  'lib/session',
  'lib/profile-client',
  'lib/constants'
],
// FxaClientWrapper is the object that is used in
// fxa-content-server views. It wraps FxaClient to
// take care of some app-specific housekeeping.
function (chai, $, sinon,
              Session, ProfileClient, Constants) {
  /*global beforeEach, afterEach, describe, it*/

  var PROFILE_URL = 'http://127.0.0.1:1111';
  var assert = chai.assert;
  var client;
  var server;
  var EMAIL = 'user@example.domain';
  var UID = '6d940dd41e636cc156074109b8092f96';
  var URL = 'http://127.0.0.1:1112/avatar/example.jpg';

  describe('lib/profile-client', function () {
    beforeEach(function () {
      server = sinon.fakeServer.create();
      server.autoRespond = true;
      Session.clear();

      client = new ProfileClient({
        profileUrl: PROFILE_URL,
        token: 'deadbeef'
      });
    });

    afterEach(function () {
      server.restore();
      Session.clear();
    });

    describe('profile-client', function () {
      describe('getProfile', function () {

        it('normally responds with profile', function () {
          server.respondWith('GET', PROFILE_URL + '/v1/profile',
            [200, { 'Content-Type': 'application/json' },
            '{ "uid": "' + UID + '", "email": "' + EMAIL + '" }']);

          return client.getProfile()
            .then(function (result) {
              assert.ok(result);
              assert.equal(result.uid, UID);
              assert.equal(result.email, EMAIL);
            });
        });

        it('responds with a SERVICE_UNAVAILABLE error if the service is unavailable', function () {
          server.respondWith('GET', PROFILE_URL + '/v1/profile',
            [0, {}, '']);

          return client.getProfile()
            .then(function (result) {
              assert.fail('unexpected success');
            }, function (err) {
              assert.isTrue(ProfileClient.Errors.is(err, 'SERVICE_UNAVAILABLE'));
            });
        });

        it('converts returned errors to Profile server error objects', function () {
          server.respondWith('GET', PROFILE_URL + '/v1/profile', [
            403,
            { 'Content-Type': 'application/json' },
            JSON.stringify(ProfileClient.Errors.toError('IMAGE_PROCESSING_ERROR'))
          ]);

          return client.getProfile()
            .then(function (result) {
              assert.fail('unexpected success');
            }, function (err) {
              assert.isTrue(ProfileClient.Errors.is(err, 'IMAGE_PROCESSING_ERROR'));
            });
        });
      });

      describe('getAvatar', function () {
        it('normally responds with avatar', function () {
          server.respondWith('GET', PROFILE_URL + '/v1/avatar',
            [200, { 'Content-Type': 'application/json' },
            '{ "avatar": "' + URL + '" }']);

          return client.getAvatar()
            .then(function (result) {
              assert.ok(result);
              assert.equal(result.avatar, URL);
            });
        });
      });

      describe('getAvatars', function () {
        it('normally responds with avatar', function () {
          server.respondWith('GET', PROFILE_URL + '/v1/avatars',
            [200, { 'Content-Type': 'application/json' },
              JSON.stringify({
                avatars: [
                  { id: 'foo', selected: true, url: URL },
                  { id: 'bar', selected: false, url: 'barurl' }
                ]
              })
            ]);

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
          server.respondWith('POST', PROFILE_URL + '/v1/avatar',
            [201, {}, '']);

          return client.postAvatar('https://secure.gravatar.com/deadbeef', true);
        });
      });

      describe('uploadAvatar', function () {
        it('upload an image', function () {
          server.respondWith('POST', PROFILE_URL + '/v1/avatar/upload',
            [201, { 'Content-Type': 'application/json' },
            '{ "url": "' + URL + '" }']);

          return client.uploadAvatar('image blob goes here')
            .then(function (result) {
              assert.equal(result.url, URL);
            });
        });
      });

      describe('deleteAvatar', function () {
        it('delete an avatar url', function () {
          server.respondWith('DELETE', PROFILE_URL + '/v1/avatar/deadbeef',
            [201, {}, '']);

          return client.deleteAvatar('deadbeef', true);
        });
      });

    });
  });
});

