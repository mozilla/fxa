/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global describe,it,before,after,afterEach*/

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const checksum = require('checksum');

const assert = require('insist');
const P = require('../lib/promise');


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
const mock = require('./lib/mock')({ userid: USERID });

const db = require('../lib/db');
const Server = require('./lib/server');
const Static = require('./lib/static');

const SIZES = require('../lib/img').SIZES;

var imagePath = path.join(__dirname, 'lib', 'firefox.png');
var imageData = fs.readFileSync(imagePath);

const SIZE_SUFFIXES = Object.keys(SIZES).map(function(val) {
  if (val === 'default') {
    return '';
  }
  return '_' + val;
});

const GRAVATAR =
  'http://www.gravatar.com/avatar/00000000000000000000000000000000';

afterEach(function() {
  mock.done();
});

describe('/profile', function() {
  var tok = token();
  var user = uid();

  it('should return all of a profile', function() {
    mock.tokenGood();
    mock.email('user@example.domain');
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

  it('should handle auth server errors', function() {
    mock.token({
      user: USERID,
      scope: ['profile:write']
    });
    mock.emailFailure();

    mock.log('server', function(rec) {
      return rec.levelname === 'ERROR'
          && rec.args[0] === 'summary'
          && rec.args[1].path === '/v1/email';
    });

    mock.log('batch', function(rec) {
      return rec.levelname === 'ERROR'
          && rec.args[0] === 'email.503';
    });

    mock.log('server', function(rec) {
      return rec.levelname === 'ERROR'
          && rec.args[0] === 'summary'
          && rec.args[1].path === '/v1/profile';
    });

    mock.log('routes.email', function(rec) {
      return rec.levelname === 'ERROR'
          && rec.args[0] === 'request.auth_server.fail';
    });

    return Server.api.get({
      url: '/profile',
      headers: {
        authorization: 'Bearer ' + tok
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 503);
      assert.equal(res.result.errno, 105);
    });
  });

  it('should handle accounts deleted on auth server', function() {
    mock.token({
      user: USERID,
      scope: ['profile:write']
    });
    mock.emailFailure({ code: 400, errno: 102 });

    mock.log('batch', function(rec) {
      return rec.levelname === 'ERROR'
          && rec.args[0] === 'email.401';
    });

    mock.log('routes.email', function(rec) {
      return rec.levelname === 'INFO'
          && rec.args[0] === 'request.auth_server.fail'
          && rec.args[1].errno === 102;
    });

    return Server.api.get({
      url: '/profile',
      headers: {
        authorization: 'Bearer ' + tok
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 401);
      assert.equal(res.result.errno, 100);
    });
  });

  it('should handle unexpected 401 errors from auth server', function() {
    mock.token({
      user: USERID,
      scope: ['profile:write']
    });
    mock.emailFailure({ code: 401 });

    mock.log('batch', function(rec) {
      return rec.levelname === 'ERROR'
          && rec.args[0] === 'email.401';
    });

    mock.log('routes.email', function(rec) {
      return rec.levelname === 'INFO'
          && rec.args[0] === 'request.auth_server.fail'
          && rec.args[1].code === 401;
    });

    return Server.api.get({
      url: '/profile',
      headers: {
        authorization: 'Bearer ' + tok
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 401);
      assert.equal(res.result.errno, 100);
    });
  });

  it('should error our on unexpected 400s from auth server', function() {
    mock.token({
      user: USERID,
      scope: ['profile:write']
    });
    mock.emailFailure({ code: 400, errno: 107 });

    mock.log('batch', function(rec) {
      return rec.levelname === 'ERROR'
          && rec.args[0] === 'email.500';
    });

    mock.log('routes.email', function(rec) {
      return rec.levelname === 'ERROR'
          && rec.args[0] === 'request.auth_server.fail'
          && rec.args[1].code === 400;
    });

    return Server.api.get({
      url: '/profile',
      headers: {
        authorization: 'Bearer ' + tok
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 500);
      assert.equal(res.result.errno, 999);
    });
  });

  it('should handle oauth server failure', function() {
    mock.tokenFailure();

    mock.log('server', function(rec) {
      return rec.levelname === 'ERROR'
          && rec.args[0] === 'summary'
          && rec.args[1].path === '/v1/profile';
    });

    return Server.api.get({
      url: '/profile',
      headers: {
        authorization: 'Bearer ' + tok
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 503);
      assert.equal(res.result.errno, 104);
    });
  });

  it('should return an avatar if selected', function() {
    mock.token({
      user: user,
      scope: ['profile']
    });
    mock.email('user@example.domain');
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

  it('should return a display name if set', function() {
    mock.token({
      user: user,
      scope: ['profile']
    });
    mock.email('user@example.domain');
    return db.setDisplayName(user, 'Spock')
    .then(function() {
      return Server.api.get({
        url: '/profile',
        headers: {
          authorization: 'Bearer ' + tok
        }
      }).then(function(res) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.result.displayName, 'Spock');
      });
    });
  });

  it('should return filtered profile if smaller scope', function() {
    mock.token({
      user: USERID,
      scope: ['profile:email']
    });
    mock.email('user@example.domain');
    return Server.api.get({
      url: '/profile',
      headers: {
        authorization: 'Bearer ' + tok
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.result.email, 'user@example.domain');
      assert.equal(Object.keys(res.result).length, 1);
    });
  });

  it('should require a profile:* scope', function() {
    mock.token({
      user: USERID,
      scope: ['some:other:scope']
    });
    return Server.api.get({
      url: '/profile',
      headers: {
        authorization: 'Bearer ' + tok
      }
    }).then(function(res) {
      assert.equal(res.statusCode, 403);
    });
  });

  it('should include an etag in the http response', function() {
    mock.token({
      user: user,
      scope: ['profile']
    });
    mock.email('user@example.domain');
    return db.setDisplayName(user, 'Spock')
    .then(function() {
      return Server.api.get({
        url: '/profile',
        headers: {
          authorization: 'Bearer ' + tok
        }
      }).then(function(res) {
        assert.equal(res.statusCode, 200);
        var etag = res.headers.etag.substr(1, 40);
        var expectedEtag = checksum(JSON.stringify(res.result));
        assert.equal(etag, expectedEtag);
      });
    });
  });
});

describe('/email', function() {
  var tok = token();

  it('should return an email', function() {
    mock.tokenGood();
    mock.email('user@example.domain');
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
    mock.token({
      user: USERID,
      scope: ['profile:uid']
    });
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
    mock.tokenGood();
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

  it('should NOT return a uid if wrong scope', function() {
    mock.token({
      user: USERID,
      scope: ['profile:email']
    });
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
      mock.token({
        user: user,
        scope: ['profile:avatar']
      });
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
    it('should include an etag in the http response', function() {
      mock.token({
        user: user,
        scope: ['profile:avatar']
      });
      return Server.api.get({
        url: '/avatar',
        headers: {
          authorization: 'Bearer ' + tok
        }
      }).then(function(res) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.result.avatar, GRAVATAR);
        assert.equal(res.result.id, id2);

        var etag = res.headers.etag.substr(1, 32);
        assert.equal(etag, id2);
      });
    });

    it('should log an avatar.get activity event', function(done) {
      mock.token({
        user: user,
        scope: ['profile:avatar']
      });

      mock.log('routes.avatar.get', function(rec) {
        if (rec.levelname === 'INFO') {
          assert.equal(rec.args[0], 'activityEvent');
          assert.equal(rec.args[1].event, 'avatar.get');
          assert.equal(rec.args[1].uid, user);
          done();
          return true;
        }
      });
      return Server.api.get({
        url: '/avatar',
        headers: {
          authorization: 'Bearer ' + tok
        }
      });
    });
  });

  describe('POST', function() {
    it('should post a new avatar url', function() {
      mock.token({
        user: USERID,
        scope: ['profile:avatar:write']
      });
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

    it('should log the avatar.post activity event', function(done) {
      mock.token({
        user: USERID,
        scope: ['profile:avatar:write']
      });

      mock.log('routes.avatar.post', function(rec) {
        if (rec.levelname === 'INFO') {
          assert.equal(rec.args[0], 'activityEvent');
          assert.equal(rec.args[1].event, 'avatar.post');
          assert.equal(rec.args[1].uid, USERID);
          done();
          return true;
        }
      });

      return Server.api.post({
        url: '/avatar',
        payload: {
          url: GRAVATAR
        },
        headers: {
          authorization: 'Bearer ' + tok
        }
      });
    });

    it('should check url matches a provider', function() {
      mock.token({
        user: USERID,
        scope: ['profile:avatar:write']
      });
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

    it('should upload a new avatar', function() {
      this.slow(2000);
      this.timeout(3000);
      mock.token({
        user: USERID,
        scope: ['profile:avatar:write']
      });
      mock.image(imageData.length);
      return Server.api.post({
        url: '/avatar/upload',
        payload: imageData,
        headers: { authorization: 'Bearer ' + tok,
          'content-type': 'image/png',
          'content-length': imageData.length
        }
      }).then(function(res) {
        assert.equal(res.statusCode, 201);
        assert(res.result.url);
        assert(res.result.id);
        return res.result.url;
      }).then(function(s3url) {
        return P.all(SIZE_SUFFIXES).map(function(suffix) {
          return Static.get(s3url + suffix);
        });
      }).then(function(responses) {
        assert.equal(responses.length, SIZE_SUFFIXES.length);
        responses.forEach(function(res) {
          assert.equal(res.statusCode, 200);
        });
      });
    });

    it('should fail with an error if image cannot be identified', function() {
      this.slow(2000);
      this.timeout(3000);

      var dataLength = 2;
      mock.token({
        user: USERID,
        email: 'user@example.domain',
        scope: ['profile:avatar:write']
      });
      mock.log('img_workers', function(rec) {
        if (rec.levelname === 'ERROR') {
          return true;
        }
      });
      mock.log('server', function(rec) {
        if (rec.levelname === 'ERROR') {
          return true;
        }
      });

      return Server.api.post({
        url: '/avatar/upload',
        payload: Buffer('{}'),
        headers: { authorization: 'Bearer ' + tok,
          'content-type': 'image/png',
          'content-length': dataLength
        }
      }).then(function(res) {
        assert.equal(res.statusCode, 500);
        assert.equal(res.result.message, 'Image processing error');
      });
    });

    it('should gracefully handle and report upload failures', function() {
      mock.token({
        user: USERID,
        scope: ['profile:avatar:write']
      });
      mock.workerFailure('post', imageData.length);
      mock.log('img_workers', function(rec) {
        if (rec.levelname === 'ERROR') {
          assert.equal(
            rec.message,
            'upload.worker.error unexpected server error'
          );
          return true;
        }
      });
      mock.log('server', function(rec) {
        if (rec.levelname === 'ERROR') {
          assert.equal(rec.args[0], 'summary');
          return true;
        }
      });
      return Server.api.post({
        url: '/avatar/upload',
        payload: imageData,
        headers: {
          authorization: 'Bearer ' + tok,
          'content-type': 'image/png',
          'content-length': imageData.length
        }
      }).then(function(res) {
        assert.equal(res.statusCode, 500);
      });
    });
  });

  describe('DELETE', function() {
    var user = uid();

    describe('gravatar', function() {
      var id = avatarId();
      before(function() {
        return db.addAvatar(id, user, GRAVATAR, PROVIDER, true);
      });

      it('should fail if not owned by user', function() {
        mock.token({
          user: uid(),
          scope: ['profile:avatar:write']
        });
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
        mock.token({
          user: user,
          scope: ['profile:avatar:write']
        });
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

    describe('uploaded', function() {
      var s3url;
      var id;
      before(function() {
        mock.token({
          user: user,
          scope: ['profile:avatar:write']
        });
        mock.image(imageData.length);
        return Server.api.post({
          url: '/avatar/upload',
          payload: imageData,
          headers: { authorization: 'Bearer ' + tok,
            'content-type': 'image/png',
            'content-length': imageData.length
          }
        }).then(function(res) {
          assert.equal(res.statusCode, 201);
          s3url = res.result.url;
          id = res.result.id;
        });
      });

      it('should remove avatar from db and s3', function() {
        mock.token({
          user: user,
          scope: ['profile:avatar:write']
        });
        mock.deleteImage();
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
          return P.all(SIZE_SUFFIXES).map(function(suffix) {
            return Static.get(s3url + suffix);
          }).map(function(res) {
            assert.equal(res.statusCode, 404, res.raw.req.url);
          });
        });
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
    mock.token({
      user: user,
      scope: ['profile:avatar:write']
    });
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

describe('/display_name', function() {
  var tok = token();

  describe('GET', function() {
    it('should return a displayName', function() {
      mock.token({
        user: USERID,
        scope: ['profile:display_name']
      });

      return db.setDisplayName(USERID, 'Spock')
      .then(function() {
        return Server.api.get({
          url: '/display_name',
          headers: {
            authorization: 'Bearer ' + tok
          }
        }).then(function(res) {
          assert.equal(res.statusCode, 200);
          assert.equal(JSON.parse(res.payload).displayName, 'Spock');
        });
      });
    });

    it('should return 204 if not set', function() {
      var userId = uid();
      mock.token({
        user: userId,
        scope: ['profile:display_name']
      });

      return Server.api.get({
        url: '/display_name',
        headers: {
          authorization: 'Bearer ' + tok
        }
      }).then(function(res) {
        assert.equal(res.statusCode, 204);
        assert(!res.payload);
      });
    });

    it('should NOT return a display_name if wrong scope', function() {
      mock.token({
        user: USERID,
        scope: ['profile:email']
      });
      return Server.api.get({
        url: '/display_name',
        headers: {
          authorization: 'Bearer ' + tok
        }
      }).then(function(res) {
        assert.equal(res.statusCode, 403);
      });
    });
  });

  describe('POST', function() {
    it('should post a new display name', function() {
      var NAME = 'Spock';
      mock.token({
        user: USERID,
        scope: ['profile:display_name:write']
      });
      return Server.api.post({
        url: '/display_name',
        payload: {
          displayName: NAME
        },
        headers: {
          authorization: 'Bearer ' + tok
        }
      }).then(function(res) {
        assert.equal(res.statusCode, 200);
        return db.getDisplayName(USERID);
      }).then(function(res) {
        assert.equal(res.displayName, NAME);
      });
    });

    it('should unset the display name if given an empty string', function() {
      var NAME = 'Spock';
      mock.token({
        user: USERID,
        scope: ['profile:display_name:write']
      });
      return Server.api.post({
        url: '/display_name',
        payload: {
          displayName: NAME
        },
        headers: {
          authorization: 'Bearer ' + tok
        }
      }).then(function(res) {
        assert.equal(res.statusCode, 200);
        mock.token({
          user: USERID,
          scope: ['profile:display_name:write']
        });
        return Server.api.post({
          url: '/display_name',
          payload: {
            displayName: ''
          },
          headers: {
            authorization: 'Bearer ' + tok
          }
        });
      }).then(function(res) {
        assert.equal(res.statusCode, 200);
        mock.token({
          user: USERID,
          scope: ['profile:display_name']
        });
        return Server.api.get({
          url: '/display_name',
          headers: {
            authorization: 'Bearer ' + tok
          }
        });
      }).then(function(res) {
        assert.equal(res.statusCode, 204);
      });
    });

    it('should accept a variety of unicode characters', function() {
      var NAMES = [
        'André Citroën',
        'the unblinking ಠ_ಠ of ckarlof',
        'abominable ☃'
      ];
      return P.resolve(NAMES).each(function(NAME) {
        mock.token({
          user: USERID,
          scope: ['profile:display_name:write']
        });
        return Server.api.post({
          url: '/display_name',
          payload: {
            displayName: NAME
          },
          headers: {
            authorization: 'Bearer ' + tok
          }
        }).then(function(res) {
          assert.equal(res.statusCode, 200);
          mock.token({
            user: USERID,
            scope: ['profile:display_name']
          });
          return Server.api.get({
            url: '/display_name',
            headers: {
              authorization: 'Bearer ' + tok
            }
          });
        }).then(function(res) {
          assert.equal(res.statusCode, 200);
          // Using JSON.parse() on the payload seems to break the utf8 here..?
          //assert.equal(JSON.parse(res.payload).displayName, NAME);
          assert.equal(res.result.displayName, NAME);
        });
      });
    });

    it('should reject unicode control characters', function() {
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
      return P.resolve(NAMES).each(function(NAME) {
        mock.token({
          user: USERID,
          scope: ['profile:display_name:write']
        });
        return Server.api.post({
          url: '/display_name',
          payload: {
            displayName: NAME
          },
          headers: {
            authorization: 'Bearer ' + tok
          }
        }).then(function(res) {
          assert.equal(res.statusCode, 400);
          assert.equal(res.result.errno, 101);
        });
      });
    });
  });

});

after(function() {
  return db._clear();
});
