/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs');
const path = require('path');

const assert = require('insist');

const Server = require('./lib/server');
const db = require('../lib/db');

/*global describe,before,it*/

var avatarUrl = 'http://example.domain/path/img.png';

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
    var imageData = { url: avatarUrl };
    Server.api.post({
      url: '/avatar',
      payload: JSON.stringify(imageData),
      headers: {
        authorization: 'userid 1'
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 200);

      return db.getProfile('1');
    }).then(function(profile) {
      assert.equal(profile.avatar, avatarUrl);
    }).done(done);
  });


});

describe.skip('/avatar/upload', function() {

  it('should be able to post image binary', function(done) {
    var imagePath = path.join(__dirname, 'lib', 'firefox.png');
    var imageData = fs.readFileSync(imagePath).toString();
    Server.api.post({
      url: '/avatar/upload',
      payload: imageData,
      headers: {
        'content-type': 'image/png',
        authorization: 'userid 2'
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 200);
      return db.getProfile('2');
    }).then(function(profile) {
      assert(profile.avatar);
    }).done(done);
  });

});

describe('/users/{userId}', function() {

  var userid = require('crypto').randomBytes(8).toString('hex');
  before(function(done) {
    db.createProfile({
      uid: userid,
      avatar: avatarUrl
    }).done(function() {
      done();
    }, done);
  });

  it('should return a profile', function(done) {
    Server.api.get('/users/' + userid).then(function(res) {
      assert.equal(res.statusCode, 200);
      assert.equal(JSON.parse(res.payload).avatar.url, avatarUrl);
    }).done(done);
  });

});
