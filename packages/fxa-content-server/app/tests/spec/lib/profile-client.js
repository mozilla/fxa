/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chai from 'chai';
import ProfileClient from 'lib/profile-client';
import Session from 'lib/session';
import sinon from 'sinon';

var PROFILE_URL = 'http://localhost:1111';
var assert = chai.assert;
var client;
var server;
var EMAIL = 'user@example.domain';
var UID = '6d940dd41e636cc156074109b8092f96';
var URL = 'http://localhost:1112/avatar/example.jpg';
var token = 'deadbeef';

describe('lib/profile-client', function () {
  beforeEach(function () {
    server = sinon.fakeServer.create();
    server.autoRespond = true;
    Session.clear();

    client = new ProfileClient({
      profileUrl: PROFILE_URL,
    });
  });

  afterEach(function () {
    server.restore();
    Session.clear();
  });

  describe('profile-client', function () {
    describe('getProfile', function () {
      it('normally responds with profile', function () {
        server.respondWith('GET', PROFILE_URL + '/v1/profile', [
          200,
          { 'Content-Type': 'application/json' },
          '{ "uid": "' + UID + '", "email": "' + EMAIL + '" }',
        ]);

        return client.getProfile(token).then(function (result) {
          assert.ok(result);
          assert.equal(result.uid, UID);
          assert.equal(result.email, EMAIL);
        });
      });

      it('responds with a SERVICE_UNAVAILABLE error if the service is unavailable', function () {
        server.respondWith('GET', PROFILE_URL + '/v1/profile', [0, {}, '']);

        return client.getProfile(token).then(
          function () {
            assert.catch('unexpected success');
          },
          function (err) {
            assert.isTrue(ProfileClient.Errors.is(err, 'SERVICE_UNAVAILABLE'));
          }
        );
      });

      it('converts returned errors to Profile server error objects', function () {
        server.respondWith('GET', PROFILE_URL + '/v1/profile', [
          403,
          { 'Content-Type': 'application/json' },
          JSON.stringify(
            ProfileClient.Errors.toError('IMAGE_PROCESSING_ERROR')
          ),
        ]);

        return client.getProfile(token).then(
          function () {
            assert.catch('unexpected success');
          },
          function (err) {
            assert.isTrue(
              ProfileClient.Errors.is(err, 'IMAGE_PROCESSING_ERROR')
            );
          }
        );
      });
    });

    describe('getAvatar', function () {
      it('normally responds with avatar', function () {
        server.respondWith('GET', PROFILE_URL + '/v1/avatar', [
          200,
          { 'Content-Type': 'application/json' },
          '{ "avatar": "' + URL + '" }',
        ]);

        return client.getAvatar(token).then(function (result) {
          assert.ok(result);
          assert.equal(result.avatar, URL);
        });
      });
    });

    describe('uploadAvatar', function () {
      it('upload an image', function () {
        server.respondWith('POST', PROFILE_URL + '/v1/avatar/upload', [
          201,
          { 'Content-Type': 'application/json' },
          '{ "url": "' + URL + '" }',
        ]);

        return client
          .uploadAvatar(token, 'image blob goes here')
          .then(function (result) {
            assert.equal(result.url, URL);
          });
      });
    });

    describe('deleteAvatar', function () {
      it('delete an avatar url', function () {
        server.respondWith('DELETE', PROFILE_URL + '/v1/avatar/beefcafe', [
          201,
          { 'Content-Type': 'application/json' },
          '{}',
        ]);

        return client.deleteAvatar(token, 'beefcafe', true);
      });
    });

    describe('displayName', function () {
      it('gets displayName', function () {
        var name = 'Joe';
        server.respondWith('GET', PROFILE_URL + '/v1/display_name', [
          200,
          { 'Content-Type': 'application/json' },
          '{ "displayName": "' + name + '" }',
        ]);

        return client.getDisplayName(token).then(function (result) {
          assert.equal(result.displayName, name);
        });
      });

      it('posts a displayName', function () {
        var name = 'Joe';
        server.respondWith('POST', PROFILE_URL + '/v1/display_name', [
          201,
          { 'Content-Type': 'application/json' },
          '{}',
        ]);

        return client.postDisplayName(name).then(function (result) {
          assert.ok(result);
        });
      });
    });
  });
});
