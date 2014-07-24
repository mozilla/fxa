/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global describe,it,before,after*/

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const url = require('url');

const assert = require('insist');
const mkdirp = require('mkdirp');
const nock = require('nock');
const rimraf = require('rimraf');

const config = require('../lib/config');
const db = require('../lib/db');
const inject = require('./lib/inject');
const Server = require('./lib/server');
const WORKER = require('../lib/server/worker').create();

const USERID = crypto.randomBytes(16).toString('hex');
const TOKEN_GOOD = JSON.stringify({
  user: USERID,
  scope: ['profile'],
  email: 'user@example.domain'
});

const GRAVATAR =
  'http://www.gravatar.com/avatar/00000000000000000000000000000000';

function uid() {
  return crypto.randomBytes(16).toString('hex');
}

function token() {
  return crypto.randomBytes(32).toString('hex');
}

function mockToken() {
  var parts = url.parse(config.get('oauth.url'));
  return nock(parts.protocol + '//' + parts.host).post(parts.path + '/verify');
}

const MOCK_ID = new Array(33).join('f');
function mockWorker() {
  var parts = url.parse(config.get('worker.url'));
  var path = '';
  var headers = {
    'content-type': 'image/png',
    'content-length': 12696
  };
  return nock(parts.protocol + '//' + parts.host, {
    reqheaders: headers
  })
    .filteringPath(function filter(_path) {
      path = _path;
      return _path.replace(/\/a\/[0-9a-f]{32}/g, '/a/' + MOCK_ID);
    })
    .post('/a/' + MOCK_ID)
    .reply(200, function(uri, body) {
      return inject(WORKER, {
        method: 'POST',
        url: path,
        payload: Buffer(body, 'hex'),
        headers: headers
      });
    });
}

console.log('');
console.log('CONFIG', JSON.stringify(config.root(), null, 2));

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

describe('/avatar', function() {
  var tok = token();
  var PROVIDER = 'gravatar';

  describe('GET', function() {
    before(function() {
      var grav1 = GRAVATAR.slice(0, -1) + '1';
      var grav2 = GRAVATAR.slice(0, -1) + '2';
      return db.addAvatar(USERID, grav1, PROVIDER, true)
        .then(function() {
          // replace grav1 as selected
          return db.addAvatar(USERID, GRAVATAR, PROVIDER, true);
        }).then(function() {
          return db.addAvatar(USERID, grav2, PROVIDER, false);
        });
    });
    it('should return selected avatar', function() {
      mockToken().reply(200, JSON.stringify({
        user: USERID,
        scope: ['profile:avatar']
      }));
      return Server.api.get({
        url: '/avatar',
        headers: {
          authorization: 'Bearer ' + tok
        }
      }).then(function(res) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.result.avatar, GRAVATAR);
      });
    });
  });

  describe('POST', function() {
    it('should post a new avatar url', function() {
      mockToken().reply(200, JSON.stringify({
        user: USERID,
        scope: ['profile:avatar:write']
      }));
      return Server.api.post({
        url: '/avatar',
        payload: {
          url: GRAVATAR
        },
        headers: {
          authorization: 'Bearer ' + tok
        }
      }).then(function(res) {
        assert.equal(res.statusCode, 201);
      });
    });
    it('should check url matches a provider', function() {
      mockToken().reply(200, JSON.stringify({
        user: USERID,
        scope: ['profile:avatar:write']
      }));
      return Server.api.post({
        url: '/avatar',
        payload: {
          url: 'http://un.supported.domain/a/1.jpg'
        },
        headers: {
          authorization: 'Bearer ' + tok
        }
      }).then(function(res) {
        assert.equal(res.statusCode, 400);
        assert.equal(res.result.errno, 102);
        assert.equal(res.result.message, 'Unsupported image provider');
      });
    });
  });

  describe('upload', function() {
    var imagePath = path.join(__dirname, 'lib', 'firefox.png');
    var imageData = fs.readFileSync(imagePath);
    var pubPath = path.join(__dirname, '..', 'var', 'public');

    before(function() {
      mkdirp.sync(pubPath);
    });

    if (config.get('img.driver') === 'aws') {
      throw new Error('aws image tests not implemented');
    }

    it('should upload a new avatar', function(done) {
      this.slow(2500);
      this.timeout(4000);
      mockToken().reply(200, JSON.stringify({
        user: USERID,
        scope: ['profile:avatar:write']
      }));
      mockWorker();
      Server.api.post({
        url: '/avatar/upload',
        payload: imageData,
        headers: {
          authorization: 'Bearer ' + tok,
          'content-type': 'image/png',
          'content-length': imageData.length
        }
      }).then(function(res) {
        assert.equal(res.statusCode, 201);
        assert(res.result.url);
        return res.result.url;
      }).then(function(url) {
        console.log(path.join(pubPath, url));
        while (!fs.existsSync(path.join(pubPath, url))) {
        }
        done();
      });
    });

    after(function() {
      rimraf.sync(pubPath);
    });
  });
});

describe('/avatars', function() {
  var tok = token();
  var user = uid();

  var PROVIDER = 'gravatar';

  before(function() {
    var grav1 = GRAVATAR.slice(0, -1) + '1';
    var grav2 = GRAVATAR.slice(0, -1) + '2';
    return db.addAvatar(user, grav1, PROVIDER, true)
      .then(function() {
        // replace grav1 as selected
        return db.addAvatar(user, GRAVATAR, PROVIDER, true);
      }).then(function() {
        return db.addAvatar(user, grav2, PROVIDER, false);
      }).then(function() {
        // other user!
        return db.addAvatar(uid(), grav1, PROVIDER, true);
      });
  });

  it('should return a list of avatars', function() {
    mockToken().reply(200, JSON.stringify({
      user: user,
      scope: ['profile:avatar']
    }));
    return Server.api.get({
      url: '/avatars',
      headers: {
        authorization: 'Bearer ' + tok
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.result.avatars.length, 3);
      assert(!res.result.avatars[0].selected);
      assert(res.result.avatars[1].selected);
      assert(!res.result.avatars[2].selected);
    });
  });
});

