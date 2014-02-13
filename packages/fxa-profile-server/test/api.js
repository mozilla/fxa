/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const url = require('url');

const assert = require('insist');

const config = require('../lib/config');
const db = require('../lib/db');
const Server = require('./lib/server');

/*global describe,before,it,after*/

var avatarUrl = 'http://example.domain/path/img.png';

function userid() {
  return crypto.randomBytes(8).toString('hex');
}

describe('/users/{userId}', function() {

  var uid = userid();
  before(function(done) {
    db.createProfile({
      uid: uid,
      avatar: avatarUrl
    }).done(function() {
      done();
    }, done);
  });

  it('should return a profile', function(done) {
    Server.api.get('/users/' + uid).then(function(res) {
      assert.equal(res.statusCode, 200);
      assert.equal(JSON.parse(res.payload).avatar.url, avatarUrl);
    }).done(done);
  });

});

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
    var uid = userid();
    var imageData = { url: avatarUrl };
    Server.api.post({
      url: '/avatar',
      payload: JSON.stringify(imageData),
      headers: {
        authorization: 'userid ' + uid
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 200);

      return db.getProfile(uid);
    }).then(function(profile) {
      assert.equal(profile.avatar, avatarUrl);
    }).done(done);
  });

  it('should fail if is not a url', function(done) {
    var uid = userid();
    var imageData = { url: 'blah' };
    Server.api.post({
      url: '/avatar',
      payload: JSON.stringify(imageData),
      headers: {
        authorization: 'userid ' + uid
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 400);
    }).done(done);
  });

});

describe('/avatar/upload', function() {

  before(function() {
    fs.mkdirSync(config.get('uploads.dir'));
  });

  it('should be able to post image binary', function(done) {
    var uid = userid();
    var imagePath = path.join(__dirname, 'lib', 'firefox.png');
    var imageData = fs.readFileSync(imagePath);
    Server.api.post({
      url: '/avatar/upload',
      payload: imageData,
      headers: {
        'content-type': 'image/png',
        authorization: 'userid ' + uid
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 200);

      return Server.api.get('/users/' + uid);
    }).then(function(res) {
      var profile = res.result;
      var u = url.parse(profile.avatar.url);
      assert.equal(u.host, url.parse(config.get('uploads.url')).host);
      return u.path;
    }).then(function(avatarUrl) {
      return Server.get(avatarUrl);
    }).then(function(res) {
      assert.deepEqual(res.rawPayload, imageData,
        'returned image should equal sent image');
    }).done(done);
  });

  after(function() {
    var rimraf = require('rimraf');
    rimraf.sync(config.get('uploads.dir'));
  });

});

