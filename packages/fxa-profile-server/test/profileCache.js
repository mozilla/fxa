/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';
process.env.CACHE_EXPIRES_IN = 2000;
process.env.USE_REDIS = false;
let Server;

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const assert = require('insist');
const P = require('../lib/promise');

function randomHex(bytes) {
  return crypto.randomBytes(bytes).toString('hex');
}

function uid() {
  return randomHex(16);
}

function token() {
  return randomHex(32);
}

function clearRequireCache() {
  // Delete require cache so that correct configuration values get injected when
  // recreating server
  Object.keys(require.cache).forEach(function(key) {
    delete require.cache[key];
  });
}

const mock = require('./lib/mock')({ userid: uid() });

const imagePath = path.join(__dirname, 'lib', 'firefox.png');
const imageData = fs.readFileSync(imagePath);

const tok = token();
const NAME = 'Fennec';
const MOZILLA_EMAIL = 'user@mozilla.com';
const PROFILE_CHANGED_AT = Date.now();
const PROFILE_CHANGED_AT_LATER_TIME = PROFILE_CHANGED_AT + 1000;

function mockTokens(uid, scope, profileChangedAt) {
  mock.token({
    user: uid,
    scope: scope || ['profile'],
    profile_changed_at: profileChangedAt,
  });
}

function makeProfileReq(uid, scope, profileChangedAt) {
  mockTokens(uid, scope, profileChangedAt);
  return Server.api.get({
    url: '/profile',
    headers: {
      authorization: 'Bearer ' + tok,
    },
  });
}

describe('profile cache', function() {
  beforeEach(() => {
    clearRequireCache();
    Server = require('./lib/server');
  });

  afterEach(() => {
    mock.done();
    require('../lib/db')._teardown();
  });

  it('should cache profile info initially, and invalidate cache after 2 seconds', function(done) {
    const userid = uid();
    this.timeout(10000);
    Server.server.initialize(() => {
      let lastModified;
      // first req, store last modified header
      mock.email(MOZILLA_EMAIL);
      makeProfileReq(userid)
        .then(res => {
          assert.ok(res.headers['last-modified']);
          lastModified = res.headers['last-modified'];
          return P.delay(1000);
        })
        .then(() => {
          // second request verify cached result was returned
          return makeProfileReq(userid);
        })
        .then(res => {
          assert.ok(res.headers['last-modified']);
          assert.equal(res.headers['last-modified'], lastModified);
          return P.delay(1000);
        })
        .then(() => {
          // verify cache was invalidated due to expiration
          mock.email(MOZILLA_EMAIL);
          return makeProfileReq(userid);
        })
        .then(res => {
          assert.ok(res.headers['last-modified']);
          assert.notEqual(res.headers['last-modified'], lastModified);
          done();
        });
    });
  });

  it('should invalidate cache when display name is updated', function(done) {
    this.timeout(10000);
    const userid = uid();
    Server.server.initialize(() => {
      let lastModified;
      // first req, store last modified header
      mock.email(MOZILLA_EMAIL);
      makeProfileReq(userid)
        .then(res => {
          assert.ok(res.headers['last-modified']);
          lastModified = res.headers['last-modified'];
          return P.delay(1000);
        })
        .then(() => {
          // second request verify cached result was returned
          return makeProfileReq(userid);
        })
        .then(res => {
          assert.ok(res.headers['last-modified']);
          assert.equal(res.headers['last-modified'], lastModified);
          mock.token({
            user: userid,
            scope: ['profile:display_name:write'],
          });
          // change display name (should invaldate cache)
          return Server.api.post({
            url: '/display_name',
            payload: {
              displayName: NAME,
            },
            headers: {
              authorization: 'Bearer ' + tok,
            },
          });
        })
        .then(res => {
          assert.equal(res.statusCode, 200);
          // third req, verify cache invalidated
          mock.email(MOZILLA_EMAIL);
          return makeProfileReq(userid);
        })
        .then(res => {
          assert.ok(res.headers['last-modified']);
          assert.notEqual(res.headers['last-modified'], lastModified);
          done();
        });
    });
  });

  it('should invalidate cache when avatar is updated', function(done) {
    const userid = uid();
    this.timeout(10000);
    Server.server.initialize(() => {
      let lastModified;
      // first req, store last modified header
      mock.email(MOZILLA_EMAIL);
      makeProfileReq(userid)
        .then(res => {
          assert.ok(res.headers['last-modified']);
          lastModified = res.headers['last-modified'];
          return P.delay(1000);
        })
        .then(() => {
          // second request verify cached result was returned
          return makeProfileReq(userid);
        })
        .then(res => {
          assert.ok(res.headers['last-modified']);
          assert.equal(res.headers['last-modified'], lastModified);
          mock.token({
            user: userid,
            scope: ['profile:avatar:write'],
          });
          // upload avatar (should invaldate cache)
          mock.image(imageData.length);
          return Server.api.post({
            url: '/avatar/upload',
            payload: imageData,
            headers: {
              authorization: 'Bearer ' + tok,
              'content-type': 'image/png',
              'content-length': imageData.length,
            },
          });
        })
        .then(res => {
          assert.equal(res.statusCode, 201);
          // third req verify cache invalidated
          mock.email(MOZILLA_EMAIL);
          return makeProfileReq(userid);
        })
        .then(res => {
          assert.ok(res.headers['last-modified']);
          assert.notEqual(res.headers['last-modified'], lastModified);
          done();
        });
    });
  });

  it('should invalidate cache when auth-server profileChangedAt is greater than cached version', function(done) {
    const userid = uid();
    this.timeout(10000);
    Server.server.initialize(() => {
      let lastModified;
      // first req, store last modified header
      mock.profileChangedAt(MOZILLA_EMAIL, PROFILE_CHANGED_AT);
      makeProfileReq(userid)
        .then(res => {
          assert.ok(res.headers['last-modified']);
          lastModified = res.headers['last-modified'];
          return P.delay(500);
        })
        .then(() => {
          // second request verify cached result was returned
          return makeProfileReq(userid);
        })
        .then(res => {
          assert.ok(res.headers['last-modified']);
          assert.equal(res.headers['last-modified'], lastModified);
          return P.delay(500);
        })
        .then(() => {
          // verify cache was invalidated due to profileChangedAt update
          mock.profileChangedAt(MOZILLA_EMAIL, PROFILE_CHANGED_AT);
          return makeProfileReq(
            userid,
            undefined,
            PROFILE_CHANGED_AT_LATER_TIME
          );
        })
        .then(res => {
          assert.ok(res.headers['last-modified']);
          assert.equal(
            res.headers['last-modified'] > lastModified,
            true,
            'last-modified updated'
          );
          done();
        });
    });
  });

  it('should not cache reads with unusual sets of scopes', function(done) {
    this.timeout(10000);
    const userid = uid();
    const PARTIAL_SCOPES = ['profile:display_name', 'profile:uid'];
    Server.server.initialize(() => {
      let lastModified;
      return makeProfileReq(userid, PARTIAL_SCOPES)
        .then(res => {
          assert.ok(res.headers['last-modified']);
          lastModified = res.headers['last-modified'];
          return P.delay(1000);
        })
        .then(() => {
          return makeProfileReq(userid, PARTIAL_SCOPES);
        })
        .then(res => {
          assert.ok(res.headers['last-modified']);
          assert.ok(lastModified < res.headers['last-modified']);
          done();
        });
    });
  });

  it('should separately cache full and partial profile reads', function(done) {
    this.timeout(10000);
    const userid = uid();
    const PARTIAL_SCOPES = [
      'profile:email',
      'profile:display_name',
      'profile:uid',
    ];
    Server.server.initialize(() => {
      let avatarUrl, lastModifiedPartial, lastModifiedFull;
      mock.token({
        user: userid,
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
        .then(res => {
          const body = JSON.parse(res.payload);
          avatarUrl = body.url;
          mock.email(MOZILLA_EMAIL);
          return makeProfileReq(userid, PARTIAL_SCOPES);
        })
        .then(res => {
          const body = JSON.parse(res.payload);
          assert.equal(body.email, MOZILLA_EMAIL);
          assert.equal(body.avatar, undefined);
          assert.ok(res.headers['last-modified']);
          lastModifiedPartial = res.headers['last-modified'];
          return P.delay(1000);
        })
        .then(() => {
          mock.email(MOZILLA_EMAIL);
          return makeProfileReq(userid);
        })
        .then(res => {
          const body = JSON.parse(res.payload);
          assert.equal(body.email, MOZILLA_EMAIL);
          assert.equal(body.avatar, avatarUrl);
          assert.ok(res.headers['last-modified']);
          lastModifiedFull = res.headers['last-modified'];
          assert.notEqual(lastModifiedFull, lastModifiedPartial);
        })
        .then(() => {
          return makeProfileReq(userid, PARTIAL_SCOPES);
        })
        .then(res => {
          const body = JSON.parse(res.payload);
          assert.equal(body.email, MOZILLA_EMAIL);
          assert.equal(body.avatar, undefined);
          assert.equal(lastModifiedPartial, res.headers['last-modified']);
          return P.delay(1000);
        })
        .then(() => {
          return makeProfileReq(userid);
        })
        .then(res => {
          const body = JSON.parse(res.payload);
          assert.equal(body.email, MOZILLA_EMAIL);
          assert.equal(body.avatar, avatarUrl);
          assert.ok(res.headers['last-modified']);
          assert.equal(lastModifiedFull, res.headers['last-modified']);
          done();
        });
    });
  });

  it('should not leak unauthorized data from cached profile', function(done) {
    this.timeout(10000);
    const userid = uid();
    Server.server.initialize(() => {
      mock.coreProfile({
        email: MOZILLA_EMAIL,
        authenticationMethods: ['pwd', 'otp'],
        authenticatorAssuranceLevel: 2,
      });
      return makeProfileReq(userid)
        .then(res => {
          const body = JSON.parse(res.payload);
          assert.equal(body.email, MOZILLA_EMAIL);
          assert.deepEqual(body.amrValues, ['pwd', 'otp']);
          return P.delay(1000);
        })
        .then(() => {
          mock.email(MOZILLA_EMAIL);
          return makeProfileReq(userid, ['profile:email']);
        })
        .then(res => {
          const body = JSON.parse(res.payload);
          assert.equal(body.email, MOZILLA_EMAIL);
          assert.equal(body.amrValues, undefined);
          done();
        });
    });
  });
});
