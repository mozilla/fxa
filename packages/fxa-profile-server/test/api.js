/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const checksum = require('checksum');
const sinon = require('sinon');

const assert = require('insist');
const P = require('../lib/promise');
const config = require('../lib/config');
const avatarShared = require('../lib/routes/avatar/_shared');
const assertSecurityHeaders = require('./lib/util').assertSecurityHeaders;

const DEFAULT_AVATAR_ID = config.get('img.defaultAvatarId');

function randomHex(bytes) {
  return crypto.randomBytes(bytes).toString('hex');
}

function uid() {
  return randomHex(16);
}

function avatarId() {
  return randomHex(16);
}

function token() {
  return randomHex(32);
}

const USERID = uid();

const db = require('../lib/db');
const testServer = require('./lib/server');
const Static = require('./lib/static');

const SIZES = require('../lib/img').SIZES;

var imagePath = path.join(__dirname, 'lib', 'firefox.png');
var imageData = fs.readFileSync(imagePath);

const SIZE_SUFFIXES = Object.keys(SIZES).map(function (val) {
  if (val === 'default') {
    return '';
  }
  return '_' + val;
});

const GRAVATAR =
  'https://secure.gravatar.com/avatar/00000000000000000000000000000000';

describe('api', function () {
  let Server;
  let mock;

  before(async function () {
    Server = await testServer.create();
    mock = await require('./lib/mock')({ userid: USERID });

    return Server;
  });

  after(async function () {
    await db._teardown();
    return Server.server.stop();
  });

  afterEach(function () {
    mock.done();
  });

  describe('/cache/{uid}', function () {
    const EXPECTED_UID = '8675309';
    const EXPECTED_TOKEN = 'thisisnotthedefault';

    let origSecretBearerToken = null;
    let mockProfileCacheDrop = null;

    before(function () {
      origSecretBearerToken = config.get('secretBearerToken');
      config.set('secretBearerToken', EXPECTED_TOKEN);
      mockProfileCacheDrop = sinon
        .stub(Server.server.methods.profileCache, 'drop')
        .callsFake((uid) => P.resolve([]));
    });

    afterEach(function () {
      mockProfileCacheDrop.resetHistory();
    });

    after(function () {
      config.set('secretBearerToken', origSecretBearerToken);
    });

    it('should invalidate cache for a user with valid bearer token', function () {
      return Server.api
        .delete({
          url: `/cache/${EXPECTED_UID}`,
          headers: {
            authorization: 'Bearer ' + EXPECTED_TOKEN,
          },
        })
        .then(function (res) {
          assert.equal(res.statusCode, 200);
          assert.equal(mockProfileCacheDrop.called, true);
          assert.equal(mockProfileCacheDrop.args[0][0], EXPECTED_UID);
        });
    });

    it('should respond with 401 unauthorized for invalid bearer token', function () {
      return Server.api
        .delete({
          url: `/cache/${EXPECTED_UID}`,
          headers: {
            authorization: 'Bearer abadtoken',
          },
        })
        .then(function (res) {
          assert.equal(res.statusCode, 401);
          assert.equal(mockProfileCacheDrop.called, false);
        });
    });
  });

  describe('/profile', function () {
    var tok = token();
    var user = uid();

    it('should return all of a profile', function () {
      mock.tokenGood();
      mock.email('user@example.domain');
      return Server.api
        .get({
          url: '/profile',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then(function (res) {
          assert.equal(res.statusCode, 200);
          assert.equal(Object.keys(res.result).length, 4);
          assert.equal(res.result.uid, USERID);
          assert.equal(res.result.email, 'user@example.domain');
          assert.equal(
            res.result.avatar,
            avatarShared.fxaUrl(DEFAULT_AVATAR_ID),
            'return default avatar'
          );
          assert.equal(
            res.result.avatarDefault,
            true,
            'has the default avatar flag'
          );
          assertSecurityHeaders(res);
        });
    });

    it('should handle auth server errors', () => {
      mock.token({
        user: USERID,
        scope: ['profile:write'],
      });
      mock.emailFailure();

      mock.log('server', (rec) => {
        return (
          rec.levelname === 'ERROR' &&
          rec.args[0] === 'summary' &&
          rec.args[1].path === '/v1/_core_profile'
        );
      });

      mock.log('batch', (rec) => {
        return (
          rec.levelname === 'ERROR' && rec.args[0] === '/v1/_core_profile:503'
        );
      });

      mock.log('server', (rec) => {
        return (
          rec.levelname === 'ERROR' &&
          rec.args[0] === 'summary' &&
          rec.args[1].path === '/v1/profile'
        );
      });

      mock.log('routes._core_profile', (rec) => {
        return (
          rec.levelname === 'ERROR' &&
          rec.args[0] === 'request.auth_server.fail'
        );
      });

      return Server.api
        .get({
          url: '/profile',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then((res) => {
          assert.equal(res.statusCode, 503);
          assert.equal(res.result.errno, 105);
          assertSecurityHeaders(res);
        });
    });

    it('should handle accounts deleted on auth server', () => {
      mock.token({
        user: USERID,
        scope: ['profile:write'],
      });
      mock.emailFailure({ code: 400, errno: 102 });

      mock.log('batch', (rec) => {
        return (
          rec.levelname === 'ERROR' && rec.args[0] === '/v1/_core_profile:401'
        );
      });

      mock.log('routes._core_profile', (rec) => {
        return (
          rec.levelname === 'INFO' &&
          rec.args[0] === 'request.auth_server.fail' &&
          rec.args[1].errno === 102
        );
      });

      return Server.api
        .get({
          url: '/profile',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then((res) => {
          assert.equal(res.statusCode, 401);
          assert.equal(res.result.errno, 100);
          assertSecurityHeaders(res);
        });
    });

    it('should handle unexpected 401 errors from auth server', () => {
      mock.token({
        user: USERID,
        scope: ['profile:write'],
      });
      mock.emailFailure({ code: 401 });

      mock.log('batch', (rec) => {
        return (
          rec.levelname === 'ERROR' && rec.args[0] === '/v1/_core_profile:401'
        );
      });

      mock.log('routes._core_profile', (rec) => {
        return (
          rec.levelname === 'INFO' &&
          rec.args[0] === 'request.auth_server.fail' &&
          rec.args[1].code === 401
        );
      });

      return Server.api
        .get({
          url: '/profile',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then((res) => {
          assert.equal(res.statusCode, 401);
          assert.equal(res.result.errno, 100);
          assertSecurityHeaders(res);
        });
    });

    it('should error out on unexpected 400s from auth server', () => {
      mock.token({
        user: USERID,
        scope: ['profile:write'],
      });
      mock.emailFailure({ code: 400, errno: 107 });

      mock.log('batch', (rec) => {
        return (
          rec.levelname === 'ERROR' && rec.args[0] === '/v1/_core_profile:500'
        );
      });

      mock.log('routes._core_profile', (rec) => {
        return (
          rec.levelname === 'ERROR' &&
          rec.args[0] === 'request.auth_server.fail' &&
          rec.args[1].code === 400
        );
      });

      mock.log('server', function (rec) {
        return (
          rec.levelname === 'ERROR' &&
          rec.args[0] === 'summary' &&
          rec.args[1].path === '/v1/_core_profile'
        );
      });

      mock.log('server', function (rec) {
        return (
          rec.levelname === 'ERROR' &&
          rec.args[0] === 'summary' &&
          rec.args[1].path === '/v1/profile'
        );
      });

      return Server.api
        .get({
          url: '/profile',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then((res) => {
          assert.equal(res.statusCode, 500);
          assert.equal(res.result.errno, 999);
          assertSecurityHeaders(res);
        });
    });

    it('should handle oauth server failure', function () {
      mock.tokenFailure();

      mock.log('server', function (rec) {
        return (
          rec.levelname === 'ERROR' &&
          rec.args[0] === 'summary' &&
          rec.args[1].path === '/v1/profile'
        );
      });

      return Server.api
        .get({
          url: '/profile',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then(function (res) {
          assert.equal(res.statusCode, 503);
          assert.equal(res.result.errno, 104);
          assertSecurityHeaders(res);
        });
    });

    it('should return an avatar if selected', function () {
      mock.token({
        user: user,
        scope: ['profile'],
      });
      mock.email('user@example.domain');
      var aid = avatarId();
      var PROVIDER = 'gravatar';
      return db.addAvatar(aid, user, GRAVATAR, PROVIDER).then(function () {
        return Server.api
          .get({
            url: '/profile',
            headers: {
              authorization: 'Bearer ' + tok,
            },
          })
          .then(function (res) {
            assert.equal(res.statusCode, 200);
            assert.equal(res.result.avatar, GRAVATAR);
            assertSecurityHeaders(res);
          });
      });
    });

    it('should return a display name if set', function () {
      mock.token({
        user: user,
        scope: ['profile'],
      });
      mock.email('user@example.domain');
      return db.setDisplayName(user, 'Spock').then(function () {
        return Server.api
          .get({
            url: '/profile',
            headers: {
              authorization: 'Bearer ' + tok,
            },
          })
          .then(function (res) {
            assert.equal(res.statusCode, 200);
            assert.equal(res.result.displayName, 'Spock');
            assertSecurityHeaders(res);
          });
      });
    });

    it('should return filtered profile if smaller scope', function () {
      mock.token({
        user: USERID,
        scope: ['profile:email'],
      });
      mock.email('user@example.domain');
      return Server.api
        .get({
          url: '/profile',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then(function (res) {
          assert.equal(res.statusCode, 200);
          assert.equal(res.result.email, 'user@example.domain');
          assert.equal(Object.keys(res.result).length, 1);
          assertSecurityHeaders(res);
        });
    });

    it('should require a profile:* scope', function () {
      mock.token({
        user: USERID,
        scope: ['some:other:scope'],
      });
      return Server.api
        .get({
          url: '/profile',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then(function (res) {
          assert.equal(res.statusCode, 403);
          assertSecurityHeaders(res);
        });
    });

    it('should include an etag in the http response', function () {
      mock.token({
        user: user,
        scope: ['profile'],
      });
      mock.email('user@example.domain');
      return db.setDisplayName(user, 'Spock').then(function () {
        return Server.api
          .get({
            url: '/profile',
            headers: {
              authorization: 'Bearer ' + tok,
            },
          })
          .then(function (res) {
            assert.equal(res.statusCode, 200);
            var etag = res.headers.etag.substr(1, 40);
            var expectedEtag = checksum(JSON.stringify(res.result));
            assert.equal(etag, expectedEtag);
            assertSecurityHeaders(res);
          });
      });
    });

    it('should support openid-connect "email" scope', function () {
      mock.token({
        user: USERID,
        scope: ['openid', 'email'],
      });
      mock.email('user@example.domain');
      return Server.api
        .get({
          url: '/profile',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then(function (res) {
          assert.equal(res.statusCode, 200);
          assert.equal(res.result.email, 'user@example.domain');
          assert.equal(res.result.sub, USERID);
          assert.equal(Object.keys(res.result).length, 2);
          assertSecurityHeaders(res);
        });
    });
  });

  describe('/email', function () {
    var tok = token();

    it('should return an email', function () {
      mock.tokenGood();
      mock.email('user@example.domain');
      return Server.api
        .get({
          url: '/email',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then(function (res) {
          assert.equal(res.statusCode, 200);
          assert.equal(JSON.parse(res.payload).email, 'user@example.domain');
          assertSecurityHeaders(res);
        });
    });

    it('should NOT return email if wrong scope', function () {
      mock.token({
        user: USERID,
        scope: ['profile:uid'],
      });
      return Server.api
        .get({
          url: '/email',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then(function (res) {
          assert.equal(res.statusCode, 403);
          assertSecurityHeaders(res);
        });
    });
  });

  describe('/subscriptions', function () {
    var tok = token();

    it('should return subscriptions if auth server includes them', function () {
      const expected = ['MechaMozilla', 'FirefoxPro'];
      mock.token({
        user: USERID,
        scope: ['profile:subscriptions'],
      });
      mock.subscriptions(expected);
      return Server.api
        .get({
          url: '/subscriptions',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then(function (res) {
          assert.equal(res.statusCode, 200);
          assert.deepEqual(JSON.parse(res.payload).subscriptions, expected);
          assertSecurityHeaders(res);
        });
    });

    it('should return subscriptions as empty list if missing from auth server', function () {
      mock.token({
        user: USERID,
        scope: ['profile:subscriptions'],
      });
      mock.email('foo@example.com');
      return Server.api
        .get({
          url: '/subscriptions',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then(function (res) {
          assert.equal(res.statusCode, 200);
          assert.deepEqual(JSON.parse(res.payload).subscriptions, []);
          assertSecurityHeaders(res);
        });
    });

    it('should NOT return subscriptions if not profile:subscriptions scope', function () {
      mock.token({
        user: USERID,
        scope: ['profile:email'],
      });
      return Server.api
        .get({
          url: '/subscriptions',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then(function (res) {
          assert.equal(res.statusCode, 403);
          assertSecurityHeaders(res);
        });
    });
  });

  describe('/_core_profile', () => {
    const tok = token();

    it('should be hidden from external callers by default', () => {
      return Server.api
        .get({
          url: '/_core_profile',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then((res) => {
          assert.equal(res.statusCode, 404);
        });
    });

    it('should return all fields returned by auth-server', () => {
      mock.tokenGood();
      mock.coreProfile({
        email: 'user@example.domain',
        locale: 'en-US',
        authenticationMethods: ['pwd'],
        authenticatorAssuranceLevel: 1,
        ecosystemAnonId: 'foo.barzzy.123',
      });
      return Server.api
        .get({
          allowInternals: true,
          url: '/_core_profile',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then((res) => {
          assert.equal(res.statusCode, 200);
          const body = JSON.parse(res.payload);
          assert.equal(Object.keys(body).length, 5);
          assert.equal(body.email, 'user@example.domain');
          assert.equal(body.locale, 'en-US');
          assert.deepEqual(body.amrValues, ['pwd']);
          assert.equal(body.twoFactorAuthentication, false);
          assert.equal(typeof body.subscriptions, 'undefined');
          assert.equal(body.ecosystemAnonId, 'foo.barzzy.123');
          assertSecurityHeaders(res);
        });
    });

    it('should return subscriptions if returned by auth-server', () => {
      const expected = ['MechaMozilla', 'FirefoxPro'];
      mock.tokenGood();
      mock.coreProfile({
        email: 'user@example.domain',
        locale: 'en-US',
        authenticationMethods: ['pwd'],
        authenticatorAssuranceLevel: 1,
        subscriptions: expected,
      });
      return Server.api
        .get({
          allowInternals: true,
          url: '/_core_profile',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then((res) => {
          assert.equal(res.statusCode, 200);
          const body = JSON.parse(res.payload);
          assert.deepEqual(body.subscriptions, expected);
          assertSecurityHeaders(res);
        });
    });

    it('should omit `email` if not returned by auth-server', () => {
      mock.tokenGood();
      mock.coreProfile({
        locale: 'en-US',
        authenticationMethods: ['pwd'],
        authenticatorAssuranceLevel: 1,
      });
      return Server.api
        .get({
          allowInternals: true,
          url: '/_core_profile',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then((res) => {
          assert.equal(res.statusCode, 200);
          const body = JSON.parse(res.payload);
          assert.equal(Object.keys(body).length, 3);
          assert.equal(body.locale, 'en-US');
          assert.deepEqual(body.amrValues, ['pwd']);
          assert.equal(body.twoFactorAuthentication, false);
          assertSecurityHeaders(res);
        });
    });

    it('should omit `locale` if not returned by auth-server', () => {
      mock.tokenGood();
      mock.coreProfile({
        email: 'user@example.domain',
        authenticationMethods: ['pwd'],
        authenticatorAssuranceLevel: 1,
      });
      return Server.api
        .get({
          allowInternals: true,
          url: '/_core_profile',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then((res) => {
          assert.equal(res.statusCode, 200);
          const body = JSON.parse(res.payload);
          assert.equal(Object.keys(body).length, 3);
          assert.equal(body.email, 'user@example.domain');
          assert.deepEqual(body.amrValues, ['pwd']);
          assert.equal(body.twoFactorAuthentication, false);
          assertSecurityHeaders(res);
        });
    });

    it('should omit auth info if not returned by auth-server', () => {
      mock.tokenGood();
      mock.coreProfile({
        email: 'user@example.domain',
        locale: 'en-AU',
      });
      return Server.api
        .get({
          allowInternals: true,
          url: '/_core_profile',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then((res) => {
          assert.equal(res.statusCode, 200);
          const body = JSON.parse(res.payload);
          assert.equal(Object.keys(body).length, 2);
          assert.equal(body.email, 'user@example.domain');
          assert.equal(body.locale, 'en-AU');
          assertSecurityHeaders(res);
        });
    });

    it('should correctly reflect 2FA status of the account', () => {
      mock.tokenGood();
      mock.coreProfile({
        email: 'user@example.domain',
        locale: 'en-AU',
        authenticationMethods: ['pwd', 'otp'],
        authenticatorAssuranceLevel: 2,
      });
      return Server.api
        .get({
          allowInternals: true,
          url: '/_core_profile',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then((res) => {
          assert.equal(res.statusCode, 200);
          const body = JSON.parse(res.payload);
          assert.equal(Object.keys(body).length, 4);
          assert.equal(body.email, 'user@example.domain');
          assert.equal(body.locale, 'en-AU');
          assert.deepEqual(body.amrValues, ['pwd', 'otp']);
          assert.equal(body.twoFactorAuthentication, true);
          assertSecurityHeaders(res);
        });
    });

    it('should omit `ecosystem_anon_id` if not returned by auth-server', async () => {
      mock.tokenGood();
      mock.coreProfile({
        email: 'user@example.domain',
      });
      const res = await Server.api.get({
        allowInternals: true,
        url: '/_core_profile',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });

      assert.equal(res.statusCode, 200);
      const body = JSON.parse(res.payload);
      assert.equal(Object.keys(body).length, 1);
      assert.equal(body.email, 'user@example.domain');
      assertSecurityHeaders(res);
    });
  });

  describe('/uid', function () {
    var tok = token();

    it('should return an uid', function () {
      mock.tokenGood();
      return Server.api
        .get({
          url: '/uid',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then(function (res) {
          assert.equal(res.statusCode, 200);
          assert.equal(JSON.parse(res.payload).uid, USERID);
          assertSecurityHeaders(res);
        });
    });

    it('should NOT return a uid if wrong scope', function () {
      mock.token({
        user: USERID,
        scope: ['profile:email'],
      });
      return Server.api
        .get({
          url: '/uid',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        })
        .then(function (res) {
          assert.equal(res.statusCode, 403);
          assertSecurityHeaders(res);
        });
    });
  });

  describe('/avatar', function () {
    var tok = token();
    var PROVIDER = 'gravatar';
    var user = uid();
    var id1 = avatarId();
    var id2 = avatarId();

    describe('GET', function () {
      before(function () {
        var grav1 = GRAVATAR.slice(0, -1) + '1';
        return db.addAvatar(id1, user, grav1, PROVIDER).then(function () {
          // replace grav1 as selected
          return db.addAvatar(id2, user, GRAVATAR, PROVIDER);
        });
      });
      it('should return selected avatar', function () {
        mock.token({
          user: user,
          scope: ['profile:avatar'],
        });
        return Server.api
          .get({
            url: '/avatar',
            headers: {
              authorization: 'Bearer ' + tok,
            },
          })
          .then(function (res) {
            assert.equal(res.statusCode, 200);
            assert.equal(Object.keys(res.result).length, 3);
            assert.equal(res.result.avatar, GRAVATAR);
            assert.equal(res.result.id, id2);
            assert.equal(res.result.avatarDefault, false);
            assertSecurityHeaders(res);
          });
      });
      it('should include an etag in the http response', function () {
        mock.token({
          user: user,
          scope: ['profile:avatar'],
        });
        return Server.api
          .get({
            url: '/avatar',
            headers: {
              authorization: 'Bearer ' + tok,
            },
          })
          .then(function (res) {
            assert.equal(res.statusCode, 200);
            assert.equal(res.result.avatar, GRAVATAR);
            assert.equal(res.result.id, id2);

            var etag = res.headers.etag.substr(1, 32);
            assert.equal(etag, id2);
            assertSecurityHeaders(res);
          });
      });

      it('should log an avatar.get activity event', function (done) {
        mock.token({
          user: user,
          scope: ['profile:avatar'],
        });

        mock.log('routes.avatar.get', function (rec) {
          if (rec.levelname === 'INFO') {
            assert.equal(rec.args[0], 'activityEvent');
            assert.equal(rec.args[1].event, 'avatar.get');
            assert.equal(rec.args[1].uid, user);
            done();
            return true;
          }
        });

        Server.api.get({
          url: '/avatar',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        });
      });
    });

    describe('upload', function () {
      it('should upload a new avatar', function () {
        this.slow(5000);
        this.timeout(10000);
        mock.token({
          user: USERID,
          scope: ['profile:avatar:write'],
        });
        mock.image(imageData.length);
        return Server.api
          .post({
            url: '/avatar/upload',
            payload: imageData,
            headers: {
              authorization: 'Bearer ' + tok,
              'content-type': 'image/png',
              'content-length': imageData.length,
            },
          })
          .then(function (res) {
            assert.equal(res.statusCode, 201);
            assert(res.result.url);
            assert(res.result.id);
            assertSecurityHeaders(res);
            return res.result.url;
          })
          .then(function (s3url) {
            return P.all(SIZE_SUFFIXES).map(function (suffix) {
              return Static.get(s3url + suffix);
            });
          })
          .then(function (responses) {
            assert.equal(responses.length, SIZE_SUFFIXES.length);
            responses.forEach(function (res) {
              assert.equal(res.statusCode, 200);
            });
          });
      });

      it('should fail with an error if image cannot be identified', function () {
        this.slow(5000);
        this.timeout(10000);

        var dataLength = 2;
        mock.token({
          user: USERID,
          email: 'user@example.domain',
          scope: ['profile:avatar:write'],
        });
        mock.log('img_workers', function (rec) {
          if (rec.levelname === 'ERROR') {
            return true;
          }
        });
        mock.log('server', function (rec) {
          if (rec.levelname === 'ERROR') {
            return true;
          }
        });

        return Server.api
          .post({
            url: '/avatar/upload',
            payload: Buffer.from('{}'),
            headers: {
              authorization: 'Bearer ' + tok,
              'content-type': 'image/png',
              'content-length': dataLength,
            },
          })
          .then(function (res) {
            assert.equal(res.statusCode, 500);
            assert.equal(res.result.message, 'Image processing error');
            assertSecurityHeaders(res);
          });
      });

      it('should gracefully handle and report upload failures', function () {
        mock.token({
          user: USERID,
          scope: ['profile:avatar:write'],
        });
        mock.workerFailure('post', imageData.length, [{ error: 'wibble' }]);
        mock.log('img_workers', function (rec) {
          if (rec.levelname === 'ERROR') {
            assert.equal(rec.message, 'upload.worker.error wibble');
            return true;
          }
        });
        mock.log('server', function (rec) {
          if (rec.levelname === 'ERROR') {
            assert.equal(rec.args[0], 'summary');
            return true;
          }
        });
        return Server.api
          .post({
            url: '/avatar/upload',
            payload: imageData,
            headers: {
              authorization: 'Bearer ' + tok,
              'content-type': 'image/png',
              'content-length': imageData.length,
            },
          })
          .then(function (res) {
            assert.equal(res.statusCode, 500);
            assertSecurityHeaders(res);
          });
      });

      it('should require :write scope', function () {
        mock.token({
          user: USERID,
          scope: ['profile', 'profile:avatar'],
        });
        return Server.api
          .post({
            url: '/avatar/upload',
            payload: imageData,
            headers: {
              authorization: 'Bearer ' + tok,
              'content-type': 'image/png',
              'content-length': imageData.length,
            },
          })
          .then(function (res) {
            assert.equal(res.statusCode, 403);
            assertSecurityHeaders(res);
          });
      });
    });

    describe('DELETE', function () {
      var user = uid();

      it('should require :write scope', function () {
        mock.token({
          user: user,
          scope: ['profile', 'profile:avatar'],
        });
        var id = avatarId();
        return Server.api
          .delete({
            url: '/avatar/' + id,
            headers: {
              authorization: 'Bearer ' + tok,
            },
          })
          .then(function (res) {
            assert.equal(res.statusCode, 403);
            assertSecurityHeaders(res);
          });
      });

      describe('gravatar', function () {
        var id = avatarId();
        before(function () {
          return db.addAvatar(id, user, GRAVATAR, PROVIDER);
        });

        it('should fail if not owned by user', function () {
          mock.token({
            user: uid(),
            scope: ['profile:avatar:write'],
          });
          return Server.api
            .delete({
              url: '/avatar/' + id,
              headers: {
                authorization: 'Bearer ' + tok,
              },
            })
            .then(function (res) {
              assert.equal(res.statusCode, 401);
              assertSecurityHeaders(res);
            });
        });

        it('should remove avatar from user', function () {
          mock.token({
            user: user,
            scope: ['profile:avatar:write'],
          });
          return Server.api
            .delete({
              url: '/avatar/' + id,
              headers: {
                authorization: 'Bearer ' + tok,
              },
            })
            .then(function (res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              return db.getAvatar(id);
            })
            .then(function (avatar) {
              assert.equal(avatar, undefined);
            });
        });
      });

      describe('uploaded', function () {
        var s3url;
        var id;
        beforeEach(function () {
          mock.token({
            user: user,
            scope: ['profile:avatar:write'],
          });
          mock.image(imageData.length);
          return Server.api
            .post({
              url: '/avatar/upload',
              payload: imageData,
              headers: {
                authorization: 'Bearer ' + tok,
                'content-type': 'image/png',
                'content-length': imageData.length,
              },
            })
            .then(function (res) {
              assert.equal(res.statusCode, 201);
              assertSecurityHeaders(res);
              s3url = res.result.url;
              id = res.result.id;
            });
        });

        it('should remove avatar from db and s3', function () {
          mock.token({
            user: user,
            scope: ['profile:avatar:write'],
          });
          mock.deleteImage();
          return Server.api
            .delete({
              url: '/avatar/' + id,
              headers: {
                authorization: 'Bearer ' + tok,
              },
            })
            .then(function (res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              return db.getAvatar(id);
            })
            .then(function (avatar) {
              assert.equal(avatar, undefined);
              return P.all(SIZE_SUFFIXES)
                .map(function (suffix) {
                  return Static.get(s3url + suffix);
                })
                .map(function (res) {
                  assert.equal(res.statusCode, 404, res.raw.req.url);
                });
            });
        });

        it('should be able to delete without id parameter', function () {
          mock.token({
            user: user,
            scope: ['profile:avatar:write'],
          });
          mock.deleteImage();
          return Server.api
            .delete({
              url: '/avatar',
              headers: {
                authorization: 'Bearer ' + tok,
              },
            })
            .then(function (res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              return db.getAvatar(id);
            })
            .then(function (avatar) {
              assert.equal(avatar, undefined);
              return P.all(SIZE_SUFFIXES)
                .map(function (suffix) {
                  return Static.get(s3url + suffix);
                })
                .map(function (res) {
                  assert.equal(res.statusCode, 404, res.raw.req.url);
                });
            });
        });
      });
    });
  });

  describe('/display_name', function () {
    var tok = token();

    describe('GET', function () {
      it('should return a displayName', function () {
        mock.token({
          user: USERID,
          scope: ['profile:display_name'],
        });

        return db.setDisplayName(USERID, 'Spock').then(function () {
          return Server.api
            .get({
              url: '/display_name',
              headers: {
                authorization: 'Bearer ' + tok,
              },
            })
            .then(function (res) {
              assert.equal(res.statusCode, 200);
              assert.equal(JSON.parse(res.payload).displayName, 'Spock');
              assertSecurityHeaders(res);
            });
        });
      });

      it('should return 204 if not set', function () {
        var userId = uid();
        mock.token({
          user: userId,
          scope: ['profile:display_name'],
        });

        return Server.api
          .get({
            url: '/display_name',
            headers: {
              authorization: 'Bearer ' + tok,
            },
          })
          .then(function (res) {
            assert.equal(res.statusCode, 204);
            assert(!res.payload);
            assertSecurityHeaders(res);
          });
      });

      it('should NOT return a display_name if wrong scope', function () {
        mock.token({
          user: USERID,
          scope: ['profile:email'],
        });
        return Server.api
          .get({
            url: '/display_name',
            headers: {
              authorization: 'Bearer ' + tok,
            },
          })
          .then(function (res) {
            assert.equal(res.statusCode, 403);
            assertSecurityHeaders(res);
          });
      });
    });

    describe('POST', function () {
      it('should post a new display name', function () {
        var NAME = 'Spock';
        mock.token({
          user: USERID,
          scope: ['profile:display_name:write'],
        });
        return Server.api
          .post({
            url: '/display_name',
            payload: {
              displayName: NAME,
            },
            headers: {
              authorization: 'Bearer ' + tok,
            },
          })
          .then(function (res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
            return db.getDisplayName(USERID);
          })
          .then(function (res) {
            assert.equal(res.displayName, NAME);
          });
      });

      it('should fail post if display name longer than 256 chars', function () {
        var NAME = Array.from('x'.repeat('257')).join('');
        mock.token({
          user: USERID,
          scope: ['profile:display_name:write'],
        });
        return Server.api
          .post({
            url: '/display_name',
            payload: {
              displayName: NAME,
            },
            headers: {
              authorization: 'Bearer ' + tok,
            },
          })
          .then(function (res) {
            assert.equal(res.statusCode, 400);
            assertSecurityHeaders(res);
          });
      });

      it('should require :write scope', function () {
        var NAME = 'Spock';
        mock.token({
          user: USERID,
          scope: ['profile'],
        });
        return Server.api
          .post({
            url: '/display_name',
            payload: {
              displayName: NAME,
            },
            headers: {
              authorization: 'Bearer ' + tok,
            },
          })
          .then(function (res) {
            assert.equal(res.statusCode, 403);
            assertSecurityHeaders(res);
            return db.getDisplayName(USERID);
          })
          .then(function (res) {
            assert.equal(res.displayName, NAME);
          });
      });

      it('should unset the display name if given an empty string', function () {
        var NAME = 'Spock';
        mock.token({
          user: USERID,
          scope: ['profile:display_name:write'],
        });
        return Server.api
          .post({
            url: '/display_name',
            payload: {
              displayName: NAME,
            },
            headers: {
              authorization: 'Bearer ' + tok,
            },
          })
          .then(function (res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
            mock.token({
              user: USERID,
              scope: ['profile:display_name:write'],
            });
            return Server.api.post({
              url: '/display_name',
              payload: {
                displayName: '',
              },
              headers: {
                authorization: 'Bearer ' + tok,
              },
            });
          })
          .then(function (res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
            mock.token({
              user: USERID,
              scope: ['profile:display_name'],
            });
            return Server.api.get({
              url: '/display_name',
              headers: {
                authorization: 'Bearer ' + tok,
              },
            });
          })
          .then(function (res) {
            assert.equal(res.statusCode, 204);
            assertSecurityHeaders(res);
          });
      });

      it('should accept a variety of unicode characters', function () {
        var NAMES = [
          'André Citroën',
          'the unblinking ಠ_ಠ of ckarlof',
          'abominable ☃',
          // emoji
          '👍',
          '👍🏼',
          '蚋',
          '鱑',
          '☃ 👍 André Citroën ಠ_ಠ',
          'astral symbol 𝌆 🙀',
        ];
        return P.resolve(NAMES).each(function (NAME) {
          mock.token({
            user: USERID,
            scope: ['profile:display_name:write'],
          });
          return Server.api
            .post({
              url: '/display_name',
              payload: {
                displayName: NAME,
              },
              headers: {
                authorization: 'Bearer ' + tok,
              },
            })
            .then(function (res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              mock.token({
                user: USERID,
                scope: ['profile:display_name'],
              });
              return Server.api.get({
                url: '/display_name',
                headers: {
                  authorization: 'Bearer ' + tok,
                },
              });
            })
            .then(function (res) {
              assert.equal(res.statusCode, 200);
              assert.equal(JSON.parse(res.payload).displayName, NAME);
              assert.equal(res.result.displayName, NAME);
              assertSecurityHeaders(res);
            });
        });
      });

      it('should reject unicode control characters', function () {
        var NAMES = [
          'null\0terminator',
          'ring\u0007my\u0007bell',
          'new\nline',
          'line\rfeed',
          'C1 next \u0085 line',
          'paragraph \u2028 separator',
          'private \uE005 use \uF8FF block',
          'specials \uFFFB annotation terminator',
        ];
        return P.resolve(NAMES).each(function (NAME) {
          mock.token({
            user: USERID,
            scope: ['profile:display_name:write'],
          });
          return Server.api
            .post({
              url: '/display_name',
              payload: {
                displayName: NAME,
              },
              headers: {
                authorization: 'Bearer ' + tok,
              },
            })
            .then(function (res) {
              assert.equal(res.statusCode, 400);
              assert.equal(res.result.errno, 101);
              assertSecurityHeaders(res);
            });
        });
      });
    });
  });

  describe('/ecosystem_anon_id', function () {
    var tok = token();

    describe('GET', function () {
      it('should return an ecosystem_anon_id if set', async function () {
        const ECOSYSTEM_ANON_ID = 'foo.barzzy.123';
        mock.coreProfile({
          email: 'user@example.domain',
          locale: 'en-US',
          authenticationMethods: ['pwd'],
          authenticatorAssuranceLevel: 1,
          ecosystemAnonId: ECOSYSTEM_ANON_ID,
        });
        mock.token({
          user: USERID,
          scope: ['profile:ecosystem_anon_id'],
        });

        const res = await Server.api.get({
          url: '/ecosystem_anon_id',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        });

        assert.equal(res.statusCode, 200);
        assert.equal(
          JSON.parse(res.payload).ecosystemAnonId,
          ECOSYSTEM_ANON_ID
        );
        assertSecurityHeaders(res);
      });

      it('should return 204 if not set', async function () {
        // Note that ecosystemAnonId is not set in the coreProfile:
        mock.coreProfile({
          email: 'user@example.domain',
          locale: 'en-US',
          authenticationMethods: ['pwd'],
          authenticatorAssuranceLevel: 1,
        });
        mock.token({
          user: USERID,
          scope: ['profile:ecosystem_anon_id'],
        });

        const res = await Server.api.get({
          url: '/ecosystem_anon_id',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        });

        assert.equal(res.statusCode, 204);
        assert(!res.payload);
        assertSecurityHeaders(res);
      });

      it('should NOT return an ecosystem_anon_id if wrong scope', async function () {
        mock.token({
          user: USERID,
          scope: ['profile:email'],
        });

        const res = await Server.api.get({
          url: '/ecosystem_anon_id',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        });

        assert.equal(res.statusCode, 403);
        assertSecurityHeaders(res);
      });
    });

    describe('POST', function () {
      xit('should post a new ecosystem_anon_id', function () {});

      it('should fail post if the ecosystem_anon_id is not a string', async function () {
        mock.token({
          user: USERID,
          scope: ['profile:ecosystem_anon_id:write'],
        });

        const res = await Server.api.post({
          url: '/ecosystem_anon_id',
          payload: {
            ecosystemAnonId: 12345,
          },
          headers: {
            authorization: 'Bearer ' + tok,
          },
        });

        assert.equal(res.statusCode, 400);
        assertSecurityHeaders(res);
      });

      it('should fail post if the ecosystem_anon_id is empty', async function () {
        mock.token({
          user: USERID,
          scope: ['profile:ecosystem_anon_id:write'],
        });

        const res = await Server.api.post({
          url: '/ecosystem_anon_id',
          payload: {
            ecosystemAnonId: null,
          },
          headers: {
            authorization: 'Bearer ' + tok,
          },
        });

        assert.equal(res.statusCode, 400);
        assertSecurityHeaders(res);
      });

      xit('should fail post with 412 error if the If-Match header does not match the ETag', function () {});

      it('should require :write scope', async function () {
        mock.token({
          user: USERID,
          scope: ['profile:ecosystem_anon_id'],
        });

        const res = await Server.api.post({
          url: '/ecosystem_anon_id',
          payload: {
            ecosystemAnonId: 'foo-.xzzy_.bar',
          },
          headers: {
            authorization: 'Bearer ' + tok,
          },
        });

        assert.equal(res.statusCode, 403);
        assertSecurityHeaders(res);
      });

      xit('should allow base64url characters as used in JWTs', function () {});

      xit('should reject non-base64url characters', function () {});
    });
  });
});
