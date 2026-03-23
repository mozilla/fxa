/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import sinon from 'sinon';
import checksum from 'checksum';
import P from '../lib/promise';
import config from '../lib/config';
import { assertSecurityHeaders } from './lib/util';
const db = require('../lib/db');
const testServer = require('./lib/server');
const Static = require('./lib/static');
const img = require('../lib/img');
const mockFactory = require('./lib/mock');

function randomHex(bytes: number): string {
  return crypto.randomBytes(bytes).toString('hex');
}

function uid(): string {
  return randomHex(16);
}

function avatarId(): string {
  return randomHex(16);
}

function token(): string {
  return randomHex(32);
}

const USERID = uid();

const SIZES = img.SIZES;

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

const PUBLIC_URL = config.get('publicUrl');

describe('#integration - api', () => {
  let Server: any;
  let mock: any;

  beforeAll(async () => {
    Server = await testServer.create();
    mock = await mockFactory({ userid: USERID });

    return Server;
  });

  afterAll(async () => {
    try {
      // _teardown calls _clear (truncates tables) then finalize (closes pool).
      // _clear may not exist on all db backends (e.g. memory), so catch errors.
      await db._teardown();
    } catch (_e) {
      // ignore — _clear not available on this db backend
    }
    return Server.server.stop();
  });

  afterEach(() => {
    mock.done();
  });

  describe('/cache/{uid}', () => {
    const EXPECTED_UID = '8675309';
    const EXPECTED_TOKEN = 'thisisnotthedefault';

    let origSecretBearerToken: any = null;
    let mockProfileCacheDrop: sinon.SinonStub;

    beforeAll(() => {
      origSecretBearerToken = config.get('secretBearerToken');
      config.set('secretBearerToken', EXPECTED_TOKEN);
      mockProfileCacheDrop = sinon
        .stub(Server.server.methods.profileCache, 'drop')
        .callsFake((_uid: string) => P.resolve([]));
    });

    afterEach(() => {
      mockProfileCacheDrop.resetHistory();
    });

    afterAll(() => {
      config.set('secretBearerToken', origSecretBearerToken);
    });

    it('should invalidate cache for a user with valid bearer token', async () => {
      const res = await Server.api.delete({
        url: `/cache/${EXPECTED_UID}`,
        headers: {
          authorization: 'Bearer ' + EXPECTED_TOKEN,
        },
      });
      expect(res.statusCode).toBe(200);
      expect(mockProfileCacheDrop.called).toBe(true);
      expect(mockProfileCacheDrop.args[0][0]).toBe(EXPECTED_UID);
    });

    it('should respond with 401 unauthorized for invalid bearer token', async () => {
      const res = await Server.api.delete({
        url: `/cache/${EXPECTED_UID}`,
        headers: {
          authorization: 'Bearer abadtoken',
        },
      });
      expect(res.statusCode).toBe(401);
      expect(mockProfileCacheDrop.called).toBe(false);
    });
  });

  describe('/profile', () => {
    var tok = token();
    var user = uid();

    beforeAll(async () => {
      await db.addAvatar(
        avatarId(),
        USERID,
        `${PUBLIC_URL}/v1/avatar/u`,
        'fxa'
      );
    });

    it('should return all of a profile', async () => {
      mock.tokenGood();
      mock.email('user@example.domain');
      const res = await Server.api.get({
        url: '/profile',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(200);
      expect(Object.keys(res.result)).toHaveLength(4);
      expect(res.result.uid).toBe(USERID);
      expect(res.result.email).toBe('user@example.domain');
      expect(res.result.avatar).toBe(`${PUBLIC_URL}/v1/avatar/u`);
      expect(res.result.avatarDefault).toBe(false);
      assertSecurityHeaders(res);
    });

    it('should handle auth server errors', async () => {
      mock.token({
        user: USERID,
        scope: ['profile:write'],
      });
      mock.emailFailure();

      mock.log('server', (rec: any) => {
        return (
          rec.levelname === 'ERROR' &&
          rec.args[0] === 'summary' &&
          rec.args[1].path === '/v1/_core_profile'
        );
      });

      mock.log('batch', (rec: any) => {
        return (
          rec.levelname === 'ERROR' &&
          rec.args[0] === '/v1/_core_profile:503'
        );
      });

      mock.log('server', (rec: any) => {
        return (
          rec.levelname === 'ERROR' &&
          rec.args[0] === 'summary' &&
          rec.args[1].path === '/v1/profile'
        );
      });

      mock.log('routes._core_profile', (rec: any) => {
        return (
          rec.levelname === 'ERROR' &&
          rec.args[0] === 'request.auth_server.fail'
        );
      });

      const res = await Server.api.get({
        url: '/profile',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(503);
      expect(res.result.errno).toBe(105);
      assertSecurityHeaders(res);
    });

    it('should handle accounts deleted on auth server', async () => {
      mock.token({
        user: USERID,
        scope: ['profile:write'],
      });
      mock.emailFailure({ code: 400, errno: 102 });

      mock.log('batch', (rec: any) => {
        return (
          rec.levelname === 'ERROR' &&
          rec.args[0] === '/v1/_core_profile:401'
        );
      });

      mock.log('routes._core_profile', (rec: any) => {
        return (
          rec.levelname === 'INFO' &&
          rec.args[0] === 'request.auth_server.fail' &&
          rec.args[1].errno === 102
        );
      });

      const res = await Server.api.get({
        url: '/profile',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(401);
      expect(res.result.errno).toBe(100);
      assertSecurityHeaders(res);
    });

    it('should handle unexpected 401 errors from auth server', async () => {
      mock.token({
        user: USERID,
        scope: ['profile:write'],
      });
      mock.emailFailure({ code: 401 });

      mock.log('batch', (rec: any) => {
        return (
          rec.levelname === 'ERROR' &&
          rec.args[0] === '/v1/_core_profile:401'
        );
      });

      mock.log('routes._core_profile', (rec: any) => {
        return (
          rec.levelname === 'INFO' &&
          rec.args[0] === 'request.auth_server.fail' &&
          rec.args[1].code === 401
        );
      });

      const res = await Server.api.get({
        url: '/profile',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(401);
      expect(res.result.errno).toBe(100);
      assertSecurityHeaders(res);
    });

    it('should error out on unexpected 400s from auth server', async () => {
      mock.token({
        user: USERID,
        scope: ['profile:write'],
      });
      mock.emailFailure({ code: 400, errno: 107 });

      mock.log('batch', (rec: any) => {
        return (
          rec.levelname === 'ERROR' &&
          rec.args[0] === '/v1/_core_profile:500'
        );
      });

      mock.log('routes._core_profile', (rec: any) => {
        return (
          rec.levelname === 'ERROR' &&
          rec.args[0] === 'request.auth_server.fail' &&
          rec.args[1].code === 400
        );
      });

      mock.log('server', function (rec: any) {
        return (
          rec.levelname === 'ERROR' &&
          rec.args[0] === 'summary' &&
          rec.args[1].path === '/v1/_core_profile'
        );
      });

      mock.log('server', function (rec: any) {
        return (
          rec.levelname === 'ERROR' &&
          rec.args[0] === 'summary' &&
          rec.args[1].path === '/v1/profile'
        );
      });

      const res = await Server.api.get({
        url: '/profile',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(500);
      expect(res.result.errno).toBe(999);
      assertSecurityHeaders(res);
    });

    it('should handle oauth server failure', async () => {
      mock.tokenFailure();

      mock.log('server', function (rec: any) {
        return (
          rec.levelname === 'ERROR' &&
          rec.args[0] === 'summary' &&
          rec.args[1].path === '/v1/profile'
        );
      });

      const res = await Server.api.get({
        url: '/profile',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(503);
      expect(res.result.errno).toBe(104);
      assertSecurityHeaders(res);
    });

    it('should update the avatar when it needs to', async () => {
      mock.token({
        user: user,
        scope: ['profile'],
      });
      mock.email('user@example.domain');
      mock.email('user@example.domain'); // a second time for the refetch
      const res = await Server.api.get({
        url: '/profile',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(200);
      expect(res.result.avatar).toBe(`${PUBLIC_URL}/v1/avatar/u`);
      assertSecurityHeaders(res);
    });

    it('should return an avatar if selected', async () => {
      mock.token({
        user: user,
        scope: ['profile'],
      });
      mock.email('user@example.domain');
      var aid = avatarId();
      var PROVIDER = 'gravatar';
      await db.addAvatar(aid, user, GRAVATAR, PROVIDER);
      const res = await Server.api.get({
        url: '/profile',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(200);
      expect(res.result.avatar).toBe(GRAVATAR);
      assertSecurityHeaders(res);
    });

    it('should return a display name if set', async () => {
      mock.token({
        user: user,
        scope: ['profile'],
      });
      mock.email('user@example.domain');
      await db.setDisplayName(user, 'Spock');
      const res = await Server.api.get({
        url: '/profile',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(200);
      expect(res.result.displayName).toBe('Spock');
      assertSecurityHeaders(res);
    });

    it('should return filtered profile if smaller scope', async () => {
      mock.token({
        user: USERID,
        scope: ['profile:email'],
      });
      mock.email('user@example.domain');
      const res = await Server.api.get({
        url: '/profile',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(200);
      expect(res.result.email).toBe('user@example.domain');
      expect(Object.keys(res.result)).toHaveLength(1);
      assertSecurityHeaders(res);
    });

    it('should require a profile:* scope', async () => {
      mock.token({
        user: USERID,
        scope: ['some:other:scope'],
      });
      const res = await Server.api.get({
        url: '/profile',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(403);
      assertSecurityHeaders(res);
    });

    it('should include an etag in the http response', async () => {
      mock.token({
        user: user,
        scope: ['profile'],
      });
      mock.email('user@example.domain');
      await db.setDisplayName(user, 'Spock');
      const res = await Server.api.get({
        url: '/profile',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(200);
      var etag = res.headers.etag.substr(1, 40);
      var expectedEtag = checksum(JSON.stringify(res.result));
      expect(etag).toBe(expectedEtag);
      assertSecurityHeaders(res);
    });

    it('should support openid-connect "email" scope', async () => {
      mock.token({
        user: USERID,
        scope: ['openid', 'email'],
      });
      mock.email('user@example.domain');
      const res = await Server.api.get({
        url: '/profile',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(200);
      expect(res.result.email).toBe('user@example.domain');
      expect(res.result.sub).toBe(USERID);
      expect(Object.keys(res.result)).toHaveLength(2);
      assertSecurityHeaders(res);
    });
  });

  describe('/email', () => {
    var tok = token();

    it('should return an email', async () => {
      mock.tokenGood();
      mock.email('user@example.domain');
      const res = await Server.api.get({
        url: '/email',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.payload).email).toBe('user@example.domain');
      assertSecurityHeaders(res);
    });

    it('should NOT return email if wrong scope', async () => {
      mock.token({
        user: USERID,
        scope: ['profile:uid'],
      });
      const res = await Server.api.get({
        url: '/email',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(403);
      assertSecurityHeaders(res);
    });
  });

  describe('/subscriptions', () => {
    var tok = token();

    it('should return subscriptions if auth server includes them', async () => {
      const expected = ['MechaMozilla', 'FirefoxPro'];
      mock.token({
        user: USERID,
        scope: ['profile:subscriptions'],
      });
      mock.subscriptions(expected);
      const res = await Server.api.get({
        url: '/subscriptions',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.payload).subscriptions).toEqual(expected);
      assertSecurityHeaders(res);
    });

    it('should return subscriptions as empty list if missing from auth server', async () => {
      mock.token({
        user: USERID,
        scope: ['profile:subscriptions'],
      });
      mock.email('foo@example.com');
      const res = await Server.api.get({
        url: '/subscriptions',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.payload).subscriptions).toEqual([]);
      assertSecurityHeaders(res);
    });

    it('should NOT return subscriptions if not profile:subscriptions scope', async () => {
      mock.token({
        user: USERID,
        scope: ['profile:email'],
      });
      const res = await Server.api.get({
        url: '/subscriptions',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(403);
      assertSecurityHeaders(res);
    });
  });

  describe('/_core_profile', () => {
    const tok = token();

    it('should be hidden from external callers by default', async () => {
      const res = await Server.api.get({
        url: '/_core_profile',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(404);
    });

    it('should return all fields returned by auth-server', async () => {
      mock.tokenGood();
      mock.coreProfile({
        email: 'user@example.domain',
        locale: 'en-US',
        authenticationMethods: ['pwd'],
        authenticatorAssuranceLevel: 1,
      });
      const res = await Server.api.get({
        allowInternals: true,
        url: '/_core_profile',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(Object.keys(body)).toHaveLength(4);
      expect(body.email).toBe('user@example.domain');
      expect(body.locale).toBe('en-US');
      expect(body.amrValues).toEqual(['pwd']);
      expect(body.twoFactorAuthentication).toBe(false);
      expect(body.subscriptions).toBeUndefined();
      assertSecurityHeaders(res);
    });

    it('should return subscriptions if returned by auth-server', async () => {
      const expected = ['MechaMozilla', 'FirefoxPro'];
      mock.tokenGood();
      mock.coreProfile({
        email: 'user@example.domain',
        locale: 'en-US',
        authenticationMethods: ['pwd'],
        authenticatorAssuranceLevel: 1,
        subscriptions: expected,
      });
      const res = await Server.api.get({
        allowInternals: true,
        url: '/_core_profile',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.subscriptions).toEqual(expected);
      assertSecurityHeaders(res);
    });

    it('should omit `email` if not returned by auth-server', async () => {
      mock.tokenGood();
      mock.coreProfile({
        locale: 'en-US',
        authenticationMethods: ['pwd'],
        authenticatorAssuranceLevel: 1,
      });
      const res = await Server.api.get({
        allowInternals: true,
        url: '/_core_profile',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(Object.keys(body)).toHaveLength(3);
      expect(body.locale).toBe('en-US');
      expect(body.amrValues).toEqual(['pwd']);
      expect(body.twoFactorAuthentication).toBe(false);
      assertSecurityHeaders(res);
    });

    it('should omit `locale` if not returned by auth-server', async () => {
      mock.tokenGood();
      mock.coreProfile({
        email: 'user@example.domain',
        authenticationMethods: ['pwd'],
        authenticatorAssuranceLevel: 1,
      });
      const res = await Server.api.get({
        allowInternals: true,
        url: '/_core_profile',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(Object.keys(body)).toHaveLength(3);
      expect(body.email).toBe('user@example.domain');
      expect(body.amrValues).toEqual(['pwd']);
      expect(body.twoFactorAuthentication).toBe(false);
      assertSecurityHeaders(res);
    });

    it('should omit auth info if not returned by auth-server', async () => {
      mock.tokenGood();
      mock.coreProfile({
        email: 'user@example.domain',
        locale: 'en-AU',
      });
      const res = await Server.api.get({
        allowInternals: true,
        url: '/_core_profile',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(Object.keys(body)).toHaveLength(2);
      expect(body.email).toBe('user@example.domain');
      expect(body.locale).toBe('en-AU');
      assertSecurityHeaders(res);
    });

    it('should correctly reflect 2FA status of the account', async () => {
      mock.tokenGood();
      mock.coreProfile({
        email: 'user@example.domain',
        locale: 'en-AU',
        authenticationMethods: ['pwd', 'otp'],
        authenticatorAssuranceLevel: 2,
      });
      const res = await Server.api.get({
        allowInternals: true,
        url: '/_core_profile',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(Object.keys(body)).toHaveLength(4);
      expect(body.email).toBe('user@example.domain');
      expect(body.locale).toBe('en-AU');
      expect(body.amrValues).toEqual(['pwd', 'otp']);
      expect(body.twoFactorAuthentication).toBe(true);
      assertSecurityHeaders(res);
    });
  });

  describe('/uid', () => {
    var tok = token();

    it('should return an uid', async () => {
      mock.tokenGood();
      const res = await Server.api.get({
        url: '/uid',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.payload).uid).toBe(USERID);
      assertSecurityHeaders(res);
    });

    it('should NOT return a uid if wrong scope', async () => {
      mock.token({
        user: USERID,
        scope: ['profile:email'],
      });
      const res = await Server.api.get({
        url: '/uid',
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res.statusCode).toBe(403);
      assertSecurityHeaders(res);
    });
  });

  describe('/avatar', () => {
    var tok = token();
    var PROVIDER = 'gravatar';
    var user = uid();
    var id1 = avatarId();
    var id2 = avatarId();

    describe('GET', () => {
      beforeAll(async () => {
        var grav1 = GRAVATAR.slice(0, -1) + '1';
        await db.addAvatar(id1, user, grav1, PROVIDER);
        // replace grav1 as selected
        await db.addAvatar(id2, user, GRAVATAR, PROVIDER);
      });

      it('should return selected avatar', async () => {
        mock.token({
          user: user,
          scope: ['profile:avatar'],
        });
        const res = await Server.api.get({
          url: '/avatar',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        });
        expect(res.statusCode).toBe(200);
        expect(Object.keys(res.result)).toHaveLength(3);
        expect(res.result.avatar).toBe(GRAVATAR);
        expect(res.result.id).toBe(id2);
        expect(res.result.avatarDefault).toBe(false);
        assertSecurityHeaders(res);
      });

      it('should include an etag in the http response', async () => {
        mock.token({
          user: user,
          scope: ['profile:avatar'],
        });
        const res = await Server.api.get({
          url: '/avatar',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        });
        expect(res.statusCode).toBe(200);
        expect(res.result.avatar).toBe(GRAVATAR);
        expect(res.result.id).toBe(id2);

        var etag = res.headers.etag.substr(1, 32);
        expect(etag).toBe(id2);
        assertSecurityHeaders(res);
      });

      it('should log an avatar.get activity event', (done) => {
        mock.token({
          user: user,
          scope: ['profile:avatar'],
        });

        mock.log('routes.avatar.get', function (rec: any) {
          if (rec.levelname === 'INFO') {
            expect(rec.args[0]).toBe('activityEvent');
            expect(rec.args[1].event).toBe('avatar.get');
            expect(rec.args[1].uid).toBe(user);
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

    describe('upload', () => {
      it(
        'should upload a new avatar',
        async () => {
          mock.token({
            user: USERID,
            scope: ['profile:avatar:write'],
          });
          mock.image(imageData.length);
          const res = await Server.api.post({
            url: '/avatar/upload',
            payload: imageData,
            headers: {
              authorization: 'Bearer ' + tok,
              'content-type': 'image/png',
              'content-length': imageData.length,
            },
          });
          expect(res.statusCode).toBe(201);
          expect(res.result.url).toBeTruthy();
          expect(res.result.id).toBeTruthy();
          assertSecurityHeaders(res);

          const s3url = res.result.url;
          const responses = await P.all(SIZE_SUFFIXES).map(function (
            suffix: string
          ) {
            return Static.get(s3url + suffix);
          });
          expect(responses).toHaveLength(SIZE_SUFFIXES.length);
          responses.forEach(function (res: any) {
            expect(res.statusCode).toBe(200);
          });
        },
        10000
      );

      it(
        'should fail with an error if image cannot be identified',
        async () => {
          var dataLength = 2;
          mock.token({
            user: USERID,
            email: 'user@example.domain',
            scope: ['profile:avatar:write'],
          });
          mock.log('img_workers', function (rec: any) {
            if (rec.levelname === 'ERROR') {
              return true;
            }
          });
          mock.log('server', function (rec: any) {
            if (rec.levelname === 'ERROR') {
              return true;
            }
          });

          const res = await Server.api.post({
            url: '/avatar/upload',
            payload: Buffer.from('{}'),
            headers: {
              authorization: 'Bearer ' + tok,
              'content-type': 'image/png',
              'content-length': dataLength,
            },
          });
          expect(res.statusCode).toBe(500);
          expect(res.result.message).toBe('Image processing error');
          assertSecurityHeaders(res);
        },
        10000
      );

      it('should gracefully handle and report upload failures', async () => {
        mock.token({
          user: USERID,
          scope: ['profile:avatar:write'],
        });
        mock.workerFailure('post', imageData.length, [{ error: 'wibble' }]);
        mock.log('img_workers', function (rec: any) {
          if (rec.levelname === 'ERROR') {
            expect(rec.message).toBe('upload.worker.error wibble');
            return true;
          }
        });
        mock.log('server', function (rec: any) {
          if (rec.levelname === 'ERROR') {
            expect(rec.args[0]).toBe('summary');
            return true;
          }
        });
        const res = await Server.api.post({
          url: '/avatar/upload',
          payload: imageData,
          headers: {
            authorization: 'Bearer ' + tok,
            'content-type': 'image/png',
            'content-length': imageData.length,
          },
        });
        expect(res.statusCode).toBe(500);
        assertSecurityHeaders(res);
      });

      it('should require :write scope', async () => {
        mock.token({
          user: USERID,
          scope: ['profile', 'profile:avatar'],
        });
        const res = await Server.api.post({
          url: '/avatar/upload',
          payload: imageData,
          headers: {
            authorization: 'Bearer ' + tok,
            'content-type': 'image/png',
            'content-length': imageData.length,
          },
        });
        expect(res.statusCode).toBe(403);
        assertSecurityHeaders(res);
      });
    });

    describe('upload-header-excludes', () => {
      let origHeaderExcludes: any = null;
      beforeAll(() => {
        origHeaderExcludes = config.get('worker.headers_exclude');
        config.set('worker.headers_exclude', ['host', 'x-my-header']);
      });
      afterAll(() => {
        config.set('worker.headers_exclude', origHeaderExcludes);
      });

      it(
        'should exclude configured worker request headers',
        async () => {
          mock.token({
            user: USERID,
            scope: ['profile:avatar:write'],
          });
          mock.log('img_workers', function (rec: any) {
            if (
              rec.levelname === 'DEBUG' &&
              rec.args[0] === 'upload.headers'
            ) {
              expect(rec.args[1]['x-my-header']).toBeUndefined();
              expect(rec.args[1].authorization).toBe('Bearer ' + tok);
              return true;
            }
          });
          mock.image(imageData.length);
          const res = await Server.api.post({
            url: '/avatar/upload',
            payload: imageData,
            headers: {
              authorization: 'Bearer ' + tok,
              'Content-Type': 'image/png',
              'Content-Length': imageData.length,
              'X-My-Header': 'some value',
            },
          });
          expect(res.statusCode).toBe(201);
          expect(res.result.url).toBeTruthy();
          expect(res.result.id).toBeTruthy();
          assertSecurityHeaders(res);

          const s3url = res.result.url;
          const responses = await P.all(SIZE_SUFFIXES).map(function (
            suffix: string
          ) {
            return Static.get(s3url + suffix);
          });
          expect(responses).toHaveLength(SIZE_SUFFIXES.length);
          responses.forEach(function (res: any) {
            expect(res.statusCode).toBe(200);
          });
        },
        3000
      );
    });

    describe('upload-header-unconfigured', () => {
      let origHeaderExcludes: any = null;
      beforeAll(() => {
        origHeaderExcludes = config.get('worker.headers_exclude');
        config.set('worker.headers_exclude', []);
      });
      afterAll(() => {
        config.set('worker.headers_exclude', origHeaderExcludes);
      });

      it(
        'should pass-through all worker request headers',
        async () => {
          mock.token({
            user: USERID,
            scope: ['profile:avatar:write'],
          });
          mock.image(imageData.length);
          mock.log('img_workers', function (rec: any) {
            if (
              rec.levelname === 'DEBUG' &&
              rec.args[0] === 'upload.headers'
            ) {
              expect(rec.args[1]['host']).toBe('profile.firefox.local');
              expect(rec.args[1]['x-my-header']).toBe('some value');
              expect(rec.args[1]['x-ignored-header']).toBe('some value');
              expect(rec.args[1]['authorization']).toBe('Bearer ' + tok);
              expect(rec.args[1]['content-type']).toBe('image/png');
              expect(rec.args[1]['content-length']).toBe(imageData.length);
              return true;
            }
          });
          const res = await Server.api.post({
            url: '/avatar/upload',
            payload: imageData,
            headers: {
              host: 'profile.firefox.local',
              authorization: 'Bearer ' + tok,
              'content-type': 'image/png',
              'content-length': imageData.length,
              'X-My-Header': 'some value',
              'X-Ignored-Header': 'some value',
            },
          });
          expect(res.statusCode).toBe(201);
          expect(res.result.url).toBeTruthy();
          expect(res.result.id).toBeTruthy();
          assertSecurityHeaders(res);

          const s3url = res.result.url;
          const responses = await P.all(SIZE_SUFFIXES).map(function (
            suffix: string
          ) {
            return Static.get(s3url + suffix);
          });
          expect(responses).toHaveLength(SIZE_SUFFIXES.length);
          responses.forEach(function (res: any) {
            expect(res.statusCode).toBe(200);
          });
        },
        3000
      );
    });

    describe('DELETE', () => {
      var user = uid();

      it('should require :write scope', async () => {
        mock.token({
          user: user,
          scope: ['profile', 'profile:avatar'],
        });
        var id = avatarId();
        const res = await Server.api.delete({
          url: '/avatar/' + id,
          headers: {
            authorization: 'Bearer ' + tok,
          },
        });
        expect(res.statusCode).toBe(403);
        assertSecurityHeaders(res);
      });

      describe('gravatar', () => {
        var id = avatarId();
        beforeAll(async () => {
          await db.addAvatar(id, user, GRAVATAR, PROVIDER);
        });

        it('should fail if not owned by user', async () => {
          mock.token({
            user: uid(),
            scope: ['profile:avatar:write'],
          });
          const res = await Server.api.delete({
            url: '/avatar/' + id,
            headers: {
              authorization: 'Bearer ' + tok,
            },
          });
          expect(res.statusCode).toBe(401);
          assertSecurityHeaders(res);
        });

        it('should remove avatar from user', async () => {
          mock.token({
            user: user,
            scope: ['profile:avatar:write'],
          });
          const res = await Server.api.delete({
            url: '/avatar/' + id,
            headers: {
              authorization: 'Bearer ' + tok,
            },
          });
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          const avatar = await db.getAvatar(id);
          expect(avatar).toBeUndefined();
        });
      });

      describe('uploaded', () => {
        var s3url: string;
        var id: string;
        beforeEach(async () => {
          mock.token({
            user: user,
            scope: ['profile:avatar:write'],
          });
          mock.image(imageData.length);
          const res = await Server.api.post({
            url: '/avatar/upload',
            payload: imageData,
            headers: {
              authorization: 'Bearer ' + tok,
              'content-type': 'image/png',
              'content-length': imageData.length,
            },
          });
          expect(res.statusCode).toBe(201);
          assertSecurityHeaders(res);
          s3url = res.result.url;
          id = res.result.id;
        });

        it('should remove avatar from db and s3', async () => {
          mock.token({
            user: user,
            scope: ['profile:avatar:write'],
          });
          mock.deleteImage();
          const res = await Server.api.delete({
            url: '/avatar/' + id,
            headers: {
              authorization: 'Bearer ' + tok,
            },
          });
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          const avatar = await db.getAvatar(id);
          expect(avatar).toBeUndefined();
          const responses = await P.all(SIZE_SUFFIXES).map(function (
            suffix: string
          ) {
            return Static.get(s3url + suffix);
          });
          responses.forEach(function (res: any) {
            expect(res.statusCode).toBe(404);
          });
        });

        it('should be able to delete without id parameter', async () => {
          mock.token({
            user: user,
            scope: ['profile:avatar:write'],
          });
          mock.deleteImage();
          const res = await Server.api.delete({
            url: '/avatar',
            headers: {
              authorization: 'Bearer ' + tok,
            },
          });
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          const avatar = await db.getAvatar(id);
          expect(avatar).toBeUndefined();
          const responses = await P.all(SIZE_SUFFIXES).map(function (
            suffix: string
          ) {
            return Static.get(s3url + suffix);
          });
          responses.forEach(function (res: any) {
            expect(res.statusCode).toBe(404);
          });
        });
      });
    });
  });

  describe('/display_name', () => {
    var tok = token();

    const EXPECTED_TOKEN = 'thisisnotthedefault';

    let origSecretBearerToken: any = null;

    beforeAll(() => {
      origSecretBearerToken = config.get('secretBearerToken');
      config.set('secretBearerToken', EXPECTED_TOKEN);
    });

    afterAll(() => {
      config.set('secretBearerToken', origSecretBearerToken);
    });

    describe('GET', () => {
      it('should return a displayName', async () => {
        mock.token({
          user: USERID,
          scope: ['profile:display_name'],
        });

        await db.setDisplayName(USERID, 'Spock');
        const res = await Server.api.get({
          url: '/display_name',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        });
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.payload).displayName).toBe('Spock');
        assertSecurityHeaders(res);
      });

      it('should return 204 if not set', async () => {
        var userId = uid();
        mock.token({
          user: userId,
          scope: ['profile:display_name'],
        });

        const res = await Server.api.get({
          url: '/display_name',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        });
        expect(res.statusCode).toBe(204);
        expect(res.payload).toBeFalsy();
        assertSecurityHeaders(res);
      });

      it('should NOT return a display_name if wrong scope', async () => {
        mock.token({
          user: USERID,
          scope: ['profile:email'],
        });
        const res = await Server.api.get({
          url: '/display_name',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        });
        expect(res.statusCode).toBe(403);
        assertSecurityHeaders(res);
      });
    });

    describe('POST', () => {
      it('should post a new display name', async () => {
        var NAME = 'Spock';
        mock.token({
          user: USERID,
          scope: ['profile:display_name:write'],
        });
        const res = await Server.api.post({
          url: '/display_name',
          payload: {
            displayName: NAME,
          },
          headers: {
            authorization: 'Bearer ' + tok,
          },
        });
        expect(res.statusCode).toBe(200);
        assertSecurityHeaders(res);
        const dbRes = await db.getDisplayName(USERID);
        expect(dbRes.displayName).toBe(NAME);
      });

      it('should post a new display name via secretBearerToken', async () => {
        var NAME = 'Spock';
        const res = await Server.api.post({
          url: '/_display_name/' + USERID,
          payload: {
            name: NAME,
          },
          headers: {
            authorization: 'Bearer ' + EXPECTED_TOKEN,
          },
        });
        expect(res.statusCode).toBe(200);
        assertSecurityHeaders(res);
        const dbRes = await db.getDisplayName(USERID);
        expect(dbRes.displayName).toBe(NAME);
      });

      it('should fail post if display name longer than 256 chars', async () => {
        var NAME = Array.from('x'.repeat('257' as any)).join('');
        mock.token({
          user: USERID,
          scope: ['profile:display_name:write'],
        });
        const res = await Server.api.post({
          url: '/display_name',
          payload: {
            displayName: NAME,
          },
          headers: {
            authorization: 'Bearer ' + tok,
          },
        });
        expect(res.statusCode).toBe(400);
        assertSecurityHeaders(res);
      });

      it('should require :write scope', async () => {
        var NAME = 'Spock';
        mock.token({
          user: USERID,
          scope: ['profile'],
        });
        const res = await Server.api.post({
          url: '/display_name',
          payload: {
            displayName: NAME,
          },
          headers: {
            authorization: 'Bearer ' + tok,
          },
        });
        expect(res.statusCode).toBe(403);
        assertSecurityHeaders(res);
        const dbRes = await db.getDisplayName(USERID);
        expect(dbRes.displayName).toBe(NAME);
      });

      it('should unset the display name if given an empty string', async () => {
        var NAME = 'Spock';
        mock.token({
          user: USERID,
          scope: ['profile:display_name:write'],
        });
        let res = await Server.api.post({
          url: '/display_name',
          payload: {
            displayName: NAME,
          },
          headers: {
            authorization: 'Bearer ' + tok,
          },
        });
        expect(res.statusCode).toBe(200);
        assertSecurityHeaders(res);

        mock.token({
          user: USERID,
          scope: ['profile:display_name:write'],
        });
        res = await Server.api.post({
          url: '/display_name',
          payload: {
            displayName: '',
          },
          headers: {
            authorization: 'Bearer ' + tok,
          },
        });
        expect(res.statusCode).toBe(200);
        assertSecurityHeaders(res);

        mock.token({
          user: USERID,
          scope: ['profile:display_name'],
        });
        res = await Server.api.get({
          url: '/display_name',
          headers: {
            authorization: 'Bearer ' + tok,
          },
        });
        expect(res.statusCode).toBe(204);
        assertSecurityHeaders(res);
      });

      it('should accept a variety of unicode characters', async () => {
        var NAMES = [
          'Andr\u00e9 Citro\u00ebn',
          'the unblinking \u0CA0_\u0CA0 of ckarlof',
          'abominable \u2603',
          'moji\uFFFDbake',
          // emoji
          '\uD83D\uDC4D',
          '\uD83D\uDC4D\uD83C\uDFFC',
          '\u86CB',
          '\u9C51',
          '\u2603 \uD83D\uDC4D Andr\u00e9 Citro\u00ebn \u0CA0_\u0CA0',
          'astral symbol \uD834\uDF06 \uD83D\uDE40',
        ];
        for (const NAME of NAMES) {
          mock.token({
            user: USERID,
            scope: ['profile:display_name:write'],
          });
          let res = await Server.api.post({
            url: '/display_name',
            payload: {
              displayName: NAME,
            },
            headers: {
              authorization: 'Bearer ' + tok,
            },
          });
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          mock.token({
            user: USERID,
            scope: ['profile:display_name'],
          });
          res = await Server.api.get({
            url: '/display_name',
            headers: {
              authorization: 'Bearer ' + tok,
            },
          });
          expect(res.statusCode).toBe(200);
          expect(JSON.parse(res.payload).displayName).toBe(NAME);
          expect(res.result.displayName).toBe(NAME);
          assertSecurityHeaders(res);
        }
      });

      it('should reject unicode control characters', async () => {
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
        for (const NAME of NAMES) {
          mock.token({
            user: USERID,
            scope: ['profile:display_name:write'],
          });
          const res = await Server.api.post({
            url: '/display_name',
            payload: {
              displayName: NAME,
            },
            headers: {
              authorization: 'Bearer ' + tok,
            },
          });
          expect(res.statusCode).toBe(400);
          expect(res.result.errno).toBe(101);
          assertSecurityHeaders(res);
        }
      });
    });
  });
});
