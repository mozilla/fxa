/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

process.env.CACHE_EXPIRES_IN = '2000';
process.env.USE_REDIS = 'false';

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import P from '../lib/promise';

function randomHex(bytes: number): string {
  return crypto.randomBytes(bytes).toString('hex');
}

function uid(): string {
  return randomHex(16);
}

function token(): string {
  return randomHex(32);
}

function clearRequireCache(): void {
  Object.keys(require.cache).forEach(function (key) {
    delete require.cache[key];
  });
}

const imagePath = path.join(__dirname, 'lib', 'firefox.png');
const imageData = fs.readFileSync(imagePath);

const tok = token();
const NAME = '@Fennec';
const MOZILLA_EMAIL = '!user@mozilla.com';
const PROFILE_CHANGED_AT = Date.now();
const PROFILE_CHANGED_AT_LATER_TIME = PROFILE_CHANGED_AT + 1000;

describe('#integration - profile cache', () => {
  let Server: any;
  let mock: any;

  function mockTokens(
    uid: string,
    scope?: string[],
    profileChangedAt?: number
  ) {
    mock.token({
      user: uid,
      scope: scope || ['profile'],
      profile_changed_at: profileChangedAt,
    });
  }

  function makeProfileReq(
    uid: string,
    scope?: string[],
    profileChangedAt?: number
  ) {
    mockTokens(uid, scope, profileChangedAt);
    return Server.api.get({
      url: '/profile',
      headers: {
        authorization: 'Bearer ' + tok,
      },
    });
  }

  beforeAll(async () => {
    clearRequireCache();
    const testServer = require('./lib/server');
    Server = await testServer.create();
    mock = await require('./lib/mock')({ userid: uid() });

    return Server;
  });

  afterAll(async () => {
    return Server.server.stop();
  });

  afterEach(() => {
    mock.done();
  });

  it(
    'should cache profile info initially, and invalidate cache after 2 seconds',
    async () => {
      const userid = uid();

      await Server.server.initialize();
      let lastModified: string;
      // first req, store last modified header
      mock.email(MOZILLA_EMAIL);
      const res1 = await makeProfileReq(userid);
      expect(res1.headers['last-modified']).toBeTruthy();
      lastModified = res1.headers['last-modified'];

      await P.delay(1000);

      // second request verify cached result was returned
      const res2 = await makeProfileReq(userid);
      expect(res2.headers['last-modified']).toBeTruthy();
      expect(res2.headers['last-modified']).toBe(lastModified);

      await P.delay(1000);

      // verify cache was invalidated due to expiration
      mock.email(MOZILLA_EMAIL);
      const res3 = await makeProfileReq(userid);
      expect(res3.headers['last-modified']).toBeTruthy();
      expect(res3.headers['last-modified']).not.toBe(lastModified);
    },
    10000
  );

  it(
    'should invalidate cache when display name is updated',
    async () => {
      const userid = uid();
      await Server.server.initialize();
      let lastModified: string;
      // first req, store last modified header
      mock.email(MOZILLA_EMAIL);
      const res1 = await makeProfileReq(userid);
      expect(res1.headers['last-modified']).toBeTruthy();
      lastModified = res1.headers['last-modified'];

      await P.delay(1000);

      // second request verify cached result was returned
      const res2 = await makeProfileReq(userid);
      expect(res2.headers['last-modified']).toBeTruthy();
      expect(res2.headers['last-modified']).toBe(lastModified);

      mock.token({
        user: userid,
        scope: ['profile:display_name:write'],
      });
      // change display name (should invalidate cache)
      const res3 = await Server.api.post({
        url: '/display_name',
        payload: {
          displayName: NAME,
        },
        headers: {
          authorization: 'Bearer ' + tok,
        },
      });
      expect(res3.statusCode).toBe(200);

      // third req, verify cache invalidated
      mock.email(MOZILLA_EMAIL);
      const res4 = await makeProfileReq(userid);
      expect(res4.headers['last-modified']).toBeTruthy();
      expect(res4.headers['last-modified']).not.toBe(lastModified);
    },
    10000
  );

  it(
    'should invalidate cache when avatar is updated',
    async () => {
      const userid = uid();
      await Server.server.initialize();
      let lastModified: string;
      // first req, store last modified header
      mock.email(MOZILLA_EMAIL);
      const res1 = await makeProfileReq(userid);
      expect(res1.headers['last-modified']).toBeTruthy();
      lastModified = res1.headers['last-modified'];

      await P.delay(1000);

      // second request verify cached result was returned
      const res2 = await makeProfileReq(userid);
      expect(res2.headers['last-modified']).toBeTruthy();
      expect(res2.headers['last-modified']).toBe(lastModified);

      mock.token({
        user: userid,
        scope: ['profile:avatar:write'],
      });
      // upload avatar (should invalidate cache)
      mock.image(imageData.length);
      const res3 = await Server.api.post({
        url: '/avatar/upload',
        payload: imageData,
        headers: {
          authorization: 'Bearer ' + tok,
          'content-type': 'image/png',
          'content-length': imageData.length,
        },
      });
      expect(res3.statusCode).toBe(201);

      // third req verify cache invalidated
      mock.email(MOZILLA_EMAIL);
      const res4 = await makeProfileReq(userid);
      expect(res4.headers['last-modified']).toBeTruthy();
      expect(res4.headers['last-modified']).not.toBe(lastModified);
    },
    10000
  );

  it(
    'should invalidate cache when auth-server profileChangedAt is greater than cached version',
    async () => {
      const userid = uid();
      await Server.server.initialize();
      let lastModified: string;
      // first req, store last modified header
      mock.profileChangedAt(MOZILLA_EMAIL, PROFILE_CHANGED_AT);
      const res1 = await makeProfileReq(userid);
      expect(res1.headers['last-modified']).toBeTruthy();
      lastModified = res1.headers['last-modified'];

      await P.delay(500);

      // second request verify cached result was returned
      const res2 = await makeProfileReq(userid);
      expect(res2.headers['last-modified']).toBeTruthy();
      expect(res2.headers['last-modified']).toBe(lastModified);

      await P.delay(500);

      // verify cache was invalidated due to profileChangedAt update
      mock.profileChangedAt(MOZILLA_EMAIL, PROFILE_CHANGED_AT);
      const res3 = await makeProfileReq(
        userid,
        undefined,
        PROFILE_CHANGED_AT_LATER_TIME
      );
      expect(res3.headers['last-modified']).toBeTruthy();
      expect(res3.headers['last-modified'] > lastModified).toBe(true);
    },
    10000
  );

  it(
    'should not cache reads with unusual sets of scopes',
    async () => {
      const userid = uid();
      const PARTIAL_SCOPES = ['profile:display_name', 'profile:uid'];
      await Server.server.initialize();
      let lastModified: string;
      const res1 = await makeProfileReq(userid, PARTIAL_SCOPES);
      expect(res1.headers['last-modified']).toBeTruthy();
      lastModified = res1.headers['last-modified'];

      await P.delay(1000);

      const res2 = await makeProfileReq(userid, PARTIAL_SCOPES);
      expect(res2.headers['last-modified']).toBeTruthy();
      expect(lastModified < res2.headers['last-modified']).toBeTruthy();
    },
    10000
  );

  it(
    'should separately cache full and partial profile reads',
    async () => {
      const userid = uid();
      const PARTIAL_SCOPES = [
        'profile:email',
        'profile:display_name',
        'profile:uid',
      ];
      await Server.server.initialize();
      let avatarUrl: string;
      let lastModifiedPartial: string;
      let lastModifiedFull: string;

      mock.token({
        user: userid,
        scope: ['profile:avatar:write'],
      });
      mock.image(imageData.length);
      const uploadRes = await Server.api.post({
        url: '/avatar/upload',
        payload: imageData,
        headers: {
          authorization: 'Bearer ' + tok,
          'content-type': 'image/png',
          'content-length': imageData.length,
        },
      });
      const uploadBody = JSON.parse(uploadRes.payload);
      avatarUrl = uploadBody.url;

      mock.email(MOZILLA_EMAIL);
      const res1 = await makeProfileReq(userid, PARTIAL_SCOPES);
      const body1 = JSON.parse(res1.payload);
      expect(body1.email).toBe(MOZILLA_EMAIL);
      expect(body1.avatar).toBeUndefined();
      expect(res1.headers['last-modified']).toBeTruthy();
      lastModifiedPartial = res1.headers['last-modified'];

      await P.delay(1000);

      mock.email(MOZILLA_EMAIL);
      const res2 = await makeProfileReq(userid);
      const body2 = JSON.parse(res2.payload);
      expect(body2.email).toBe(MOZILLA_EMAIL);
      expect(body2.avatar).toBe(avatarUrl);
      expect(res2.headers['last-modified']).toBeTruthy();
      lastModifiedFull = res2.headers['last-modified'];
      expect(lastModifiedFull).not.toBe(lastModifiedPartial);

      const res3 = await makeProfileReq(userid, PARTIAL_SCOPES);
      const body3 = JSON.parse(res3.payload);
      expect(body3.email).toBe(MOZILLA_EMAIL);
      expect(body3.avatar).toBeUndefined();
      expect(lastModifiedPartial).toBe(res3.headers['last-modified']);

      await P.delay(1000);

      const res4 = await makeProfileReq(userid);
      const body4 = JSON.parse(res4.payload);
      expect(body4.email).toBe(MOZILLA_EMAIL);
      expect(body4.avatar).toBe(avatarUrl);
      expect(res4.headers['last-modified']).toBeTruthy();
      expect(lastModifiedFull).toBe(res4.headers['last-modified']);
    },
    10000
  );

  it(
    'should not leak unauthorized data from cached profile',
    async () => {
      const userid = uid();
      await Server.server.initialize();
      mock.coreProfile({
        email: MOZILLA_EMAIL,
        authenticationMethods: ['pwd', 'otp'],
        authenticatorAssuranceLevel: 2,
      });
      const res1 = await makeProfileReq(userid);
      const body1 = JSON.parse(res1.payload);
      expect(body1.email).toBe(MOZILLA_EMAIL);
      expect(body1.amrValues).toEqual(['pwd', 'otp']);

      await P.delay(1000);

      mock.email(MOZILLA_EMAIL);
      const res2 = await makeProfileReq(userid, ['profile:email']);
      const body2 = JSON.parse(res2.payload);
      expect(body2.email).toBe(MOZILLA_EMAIL);
      expect(body2.amrValues).toBeUndefined();
    },
    10000
  );
});
