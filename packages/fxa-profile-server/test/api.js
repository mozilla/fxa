/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const crypto = require('crypto');
const url = require('url');

const assert = require('insist');
const nock = require('nock');

const config = require('../lib/config');
const db = require('../lib/db');
const Server = require('./lib/server');

/*global describe,before,it*/

const USERID = crypto.randomBytes(16).toString('hex');
const TOKEN_GOOD = JSON.stringify({
  user: USERID,
  scope: ['profile'],
  email: 'user@example.domain'
});
var avatarUrl = 'http://example.domain/path/img.png';

function token() {
  return crypto.randomBytes(32).toString('hex');
}

function mockToken() {
  var parts = url.parse(config.get('oauth.url'));
  return nock(parts.protocol + '//' + parts.host).post(parts.path + '/verify');
}

describe('/avatar', function() {

  it('should require authentication', function(done) {
    var imageData = { url: avatarUrl };
    Server.api.post({
      url: '/avatar',
      payload: JSON.stringify(imageData)
    }).then(function(res) {
      assert.equal(res.statusCode, 401);
    }).done(done);
  });

  it('should be able to post a url', function(done) {
    mockToken().reply(200, TOKEN_GOOD);
    var tok = token();
    var imageData = { url: avatarUrl };
    Server.api.post({
      url: '/avatar',
      payload: JSON.stringify(imageData),
      headers: {
        authorization: 'Bearer ' + tok
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 200);

      return db.getProfile(USERID);
    }).then(function(profile) {
      assert.equal(profile.avatar, avatarUrl);
    }).done(done);
  });

  it('should fail if is not a url', function(done) {
    var uid = token();
    mockToken().reply(200, TOKEN_GOOD);
    var imageData = { url: 'blah' };
    Server.api.post({
      url: '/avatar',
      payload: JSON.stringify(imageData),
      headers: {
        authorization: 'Bearer ' + uid
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 400);
    }).done(done);
  });

});

describe.skip('/avatar/upload', function() {


});

describe('/email', function() {
  var uid = token();
  before(function(done) {
    db.createProfile({
      uid: uid,
      avatar: avatarUrl
    }).done(function() {
      done();
    }, done);
  });

  it('should return an email', function(done) {
    mockToken().reply(200, TOKEN_GOOD);
    Server.api.post({
      url: '/email',
      headers: {
        authorization: 'Bearer ' + uid
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 200);
      assert.equal(JSON.parse(res.payload).email, 'user@example.domain');
    }).done(done);
  });

  it('should NOT return a profile if wrong scope', function(done) {
    mockToken().reply(200, JSON.stringify({
      user: USERID,
      scope: ['foo', 'bar']
    }));
    Server.api.post({
      url: '/email',
      headers: {
        authorization: 'Bearer ' + uid
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 403);
    }).done(done);
  });
});

