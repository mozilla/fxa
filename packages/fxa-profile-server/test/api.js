/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const crypto = require('crypto');
const url = require('url');

const assert = require('insist');
const nock = require('nock');

const config = require('../lib/config');
const Server = require('./lib/server');

/*global describe,it*/

const USERID = crypto.randomBytes(16).toString('hex');
const TOKEN_GOOD = JSON.stringify({
  user: USERID,
  scope: ['profile'],
  email: 'user@example.domain'
});

function token() {
  return crypto.randomBytes(32).toString('hex');
}

function mockToken() {
  var parts = url.parse(config.get('oauth.url'));
  return nock(parts.protocol + '//' + parts.host).post(parts.path + '/verify');
}

describe('/profile', function() {
  var uid = token();

  it('should return all of a profile', function() {
    mockToken().reply(200, TOKEN_GOOD);
    return Server.api.get({
      url: '/profile',
      headers: {
        authorization: 'Bearer ' + uid
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.result.uid, USERID);
      assert.equal(res.result.email, 'user@example.domain');
    });
  });

  it('should NOT return a profile if wrong scope', function() {
    mockToken().reply(200, JSON.stringify({
      user: USERID,
      scope: ['profile:email']
    }));
    return Server.api.get({
      url: '/uid',
      headers: {
        authorization: 'Bearer ' + uid
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 403);
    });
  });
});

describe('/email', function() {
  var uid = token();

  it('should return an email', function() {
    mockToken().reply(200, TOKEN_GOOD);
    return Server.api.get({
      url: '/email',
      headers: {
        authorization: 'Bearer ' + uid
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 200);
      assert.equal(JSON.parse(res.payload).email, 'user@example.domain');
    });
  });

  it('should NOT return email if wrong scope', function() {
    mockToken().reply(200, JSON.stringify({
      user: USERID,
      scope: ['profile:uid']
    }));
    return Server.api.get({
      url: '/email',
      headers: {
        authorization: 'Bearer ' + uid
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 403);
    });
  });
});

describe('/uid', function() {
  var uid = token();

  it('should return an uid', function() {
    mockToken().reply(200, TOKEN_GOOD);
    return Server.api.get({
      url: '/uid',
      headers: {
        authorization: 'Bearer ' + uid
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 200);
      assert.equal(JSON.parse(res.payload).uid, USERID);
    });
  });

  it('should NOT return a profile if wrong scope', function() {
    mockToken().reply(200, JSON.stringify({
      user: USERID,
      scope: ['profile:email']
    }));
    return Server.api.get({
      url: '/uid',
      headers: {
        authorization: 'Bearer ' + uid
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 403);
    });
  });
});
