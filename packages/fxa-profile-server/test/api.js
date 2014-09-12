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

const config = require('../lib/config');
if (config.get('img.driver') === 'local') {
  mkdirp.sync(config.get('img.uploads.dest.public'));
}
const db = require('../lib/db');
const inject = require('./lib/inject');
const Server = require('./lib/server');
const Static = require('./lib/static');
const WORKER = require('../lib/server/worker').create();


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
const TOKEN_GOOD = JSON.stringify({
  user: USERID,
  scope: ['profile'],
  email: 'user@example.domain'
});

const GRAVATAR =
  'http://www.gravatar.com/avatar/00000000000000000000000000000000';

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

function mockAws() {
  var bucket = config.get('img.uploads.dest.public');
  var u = '/' + bucket + '/XXX';
  var id;
  return nock('https://s3.amazonaws.com')
    .filteringPath(function filter(_path) {
      id = _path.replace('/' + bucket + '/', '');
      return _path.replace(id, 'XXX');
    })
    .put(u)
    .reply(200);
}

describe('/profile', function() {
  var tok = token();
  var user = uid();

  it('should return all of a profile', function() {
    mockToken().reply(200, TOKEN_GOOD);
    return Server.api.get({
      url: '/profile',
      headers: {
        authorization: 'Bearer ' + tok
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.result.uid, USERID);
      assert.equal(res.result.email, 'user@example.domain');
      assert.equal(res.result.avatar, null);
    });
  });

  it('should return an avatar if selected', function() {
    mockToken().reply(200, JSON.stringify({
      user: user,
      email: 'user@example.domain',
      scope: ['profile']
    }));
    var aid = avatarId();
    var PROVIDER = 'gravatar';
    return db.addAvatar(aid, user, GRAVATAR, PROVIDER, true)
    .then(function() {
      return Server.api.get({
        url: '/profile',
        headers: {
          authorization: 'Bearer ' + tok
        }
      }).then(function(res) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.result.avatar, GRAVATAR);
      });
    });
  });

  it('should NOT return a profile if wrong scope', function() {
    mockToken().reply(200, JSON.stringify({
      user: USERID,
      email: 'user@example.domain',
      scope: ['profile:email']
    }));
    return Server.api.get({
      url: '/profile',
      headers: {
        authorization: 'Bearer ' + tok
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 403);
    });
  });
});

describe('/email', function() {
  var tok = token();

  it('should return an email', function() {
    mockToken().reply(200, TOKEN_GOOD);
    return Server.api.get({
      url: '/email',
      headers: {
        authorization: 'Bearer ' + tok
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 200);
      assert.equal(JSON.parse(res.payload).email, 'user@example.domain');
    });
  });

  it('should NOT return email if wrong scope', function() {
    mockToken().reply(200, JSON.stringify({
      user: USERID,
      email: 'user@example.domain',
      scope: ['profile:uid']
    }));
    return Server.api.get({
      url: '/email',
      headers: {
        authorization: 'Bearer ' + tok
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 403);
    });
  });
});

describe('/uid', function() {
  var tok = token();

  it('should return an uid', function() {
    mockToken().reply(200, TOKEN_GOOD);
    return Server.api.get({
      url: '/uid',
      headers: {
        authorization: 'Bearer ' + tok
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 200);
      assert.equal(JSON.parse(res.payload).uid, USERID);
    });
  });

  it('should NOT return a profile if wrong scope', function() {
    mockToken().reply(200, JSON.stringify({
      user: USERID,
      email: 'user@example.domain',
      scope: ['profile:email']
    }));
    return Server.api.get({
      url: '/uid',
      headers: {
        authorization: 'Bearer ' + tok
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 403);
    });
  });
});

describe('/avatar', function() {
  var tok = token();
  var PROVIDER = 'gravatar';
  var user = uid();
  var id1 = avatarId();
  var id2 = avatarId();
  var id3 = avatarId();

  describe('GET', function() {
    before(function() {
      var grav1 = GRAVATAR.slice(0, -1) + '1';
      var grav2 = GRAVATAR.slice(0, -1) + '2';
      return db.addAvatar(id1, user, grav1, PROVIDER, true)
        .then(function() {
          // replace grav1 as selected
          return db.addAvatar(id2, user, GRAVATAR, PROVIDER, true);
        }).then(function() {
          return db.addAvatar(id3, user, grav2, PROVIDER, false);
        });
    });
    it('should return selected avatar', function() {
      mockToken().reply(200, JSON.stringify({
        user: user,
        email: 'user@example.domain',
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
        assert.equal(res.result.id, id2);
      });
    });
  });

  describe('POST', function() {
    it('should post a new avatar url', function() {
      mockToken().reply(200, JSON.stringify({
        user: USERID,
        email: 'user@example.domain',
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
        assert(res.result.id);
      });
    });
    it('should check url matches a provider', function() {
      mockToken().reply(200, JSON.stringify({
        user: USERID,
        email: 'user@example.domain',
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

    it('should upload a new avatar', function() {
      this.slow(2000);
      this.timeout(3000);
      mockToken().reply(200, JSON.stringify({
        user: USERID,
        email: 'user@example.domain',
        scope: ['profile:avatar:write']
      }));
      mockWorker();
      mockAws();
      return Server.api.post({
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
        assert(res.result.id);
        return res.result.url;
      }).then(Static.get).then(function(res) {
        assert.equal(res.statusCode, 200);
      });
    });
  });

  describe('DELETE', function() {
    var user = uid();
    var id = avatarId();

    before(function() {
      return db.addAvatar(id, user, GRAVATAR, PROVIDER, true);
    });

    it('should fail if not owned by user', function() {
      mockToken().reply(200, JSON.stringify({
        user: uid(),
        email: 'user@example.domain',
        scope: ['profile:avatar:write']
      }));
      return Server.api.delete({
        url: '/avatar/' + id,
        headers: {
          authorization: 'Bearer ' + tok,
        }
      }).then(function(res) {
        assert.equal(res.statusCode, 401);
      });
    });

    it('should remove avatar from user', function() {
      mockToken().reply(200, JSON.stringify({
        user: user,
        email: 'user@example.domain',
        scope: ['profile:avatar:write']
      }));
      return Server.api.delete({
        url: '/avatar/' + id,
        headers: {
          authorization: 'Bearer ' + tok,
        }
      }).then(function(res) {
        assert.equal(res.statusCode, 200);
        return db.getAvatar(id);
      }).then(function(avatar) {
        assert.equal(avatar, undefined);
      });
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
    return db.addAvatar(avatarId(), user, grav1, PROVIDER, true)
      .then(function() {
        // replace grav1 as selected
        return db.addAvatar(avatarId(), user, GRAVATAR, PROVIDER, true);
      }).then(function() {
        return db.addAvatar(avatarId(), user, grav2, PROVIDER, false);
      }).then(function() {
        // other user!
        return db.addAvatar(avatarId(), uid(), grav1, PROVIDER, true);
      });
  });

  it('should return a list of avatars', function() {
    mockToken().reply(200, JSON.stringify({
      user: user,
      email: 'user@example.domain',
      scope: ['profile:avatar:write']
    }));
    return Server.api.get({
      url: '/avatars',
      headers: {
        authorization: 'Bearer ' + tok
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.result.avatars.length, 3);
      var selected = false;
      res.result.avatars.forEach(function(av) {
        assert(av.id);
        if (av.url === GRAVATAR) {
          assert(av.selected);
          selected = true;
        } else {
          assert(!av.selected);
        }
      });
      assert(selected);
    });
  });
});

after(function() {
  return db._clear();
});
