/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('insist');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const db = require('../lib/db');
const P = require('../lib/promise');
const assertSecurityHeaders = require('./lib/util').assertSecurityHeaders;

const UID = crypto.randomBytes(16).toString('hex');
const mock = require('./lib/mock')({ userid: UID });
const Server = require('./lib/server');
const Static = require('./lib/static');

const events = require('../lib/events')(Server.server);

const imagePath = path.join(__dirname, 'lib', 'firefox.png');
const imageData = fs.readFileSync(imagePath);

const sinon = require('sinon');

const SIZES = require('../lib/img').SIZES;
const SIZE_SUFFIXES = Object.keys(SIZES).map(function(val) {
  if (val === 'default') {
    return '';
  }
  return '_' + val;
});

/*global describe,it,beforeEach,afterEach*/

afterEach(function() {
  mock.done();
});

describe('events', function() {
  describe('onDeleteMessage', function() {
    var tok = crypto.randomBytes(32).toString('hex');
    function Message(type, onDel) {
      if (typeof type === 'function') {
        onDel = type;
        type = 'delete';
      }
      return {
        event: type,
        uid: UID,
        del: onDel,
      };
    }

    describe('avatar', function() {
      beforeEach(function() {
        mock.token({
          user: UID,
          email: 'user@example.domain',
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
          .then(function(res) {
            assert.equal(res.statusCode, 201);
            assert(res.result.url);
            assert(res.result.id);
            assertSecurityHeaders(res);
            return res.result.url;
          })
          .then(function(s3url) {
            return P.all(SIZE_SUFFIXES).map(function(suffix) {
              return Static.get(s3url + suffix);
            });
          })
          .then(function(responses) {
            assert.equal(responses.length, SIZE_SUFFIXES.length);
            responses.forEach(function(res) {
              assert.equal(res.statusCode, 200);
            });
            mock.done();
          });
      });

      it('should delete avatars', function(done) {
        mock.deleteImage();
        events.onData(
          new Message(function() {
            db.getSelectedAvatar(UID)
              .then(function(avatar) {
                assert.equal(avatar, undefined);
              })
              .done(done, done);
          })
        );
      });

      it('should not delete message on error', function(done) {
        mock.workerFailure('delete', 0);
        events.onData(
          new Message(function() {
            assert(false, 'message.del() should not be called');
          })
        );
        mock.log('events', function(record) {
          if (record.levelname === 'ERROR' && record.args[0] === 'delete') {
            setTimeout(function() {
              done();
            }, 1);
            return true;
          }
          return false;
        });
      });
    });

    it('should ignore unknown messages', function(done) {
      db.setDisplayName(UID, 'foo bar').then(function() {
        events.onData(
          new Message('baz', function() {
            db.getDisplayName(UID)
              .then(function(profile) {
                assert.equal(profile.displayName, 'foo bar');
              })
              .done(done, done);
          })
        );
      });
    });
  });

  describe('onPrimaryEmailChangedMessage', function() {
    describe('should invalidate user cache', function() {
      function Message(type, onDel) {
        if (typeof type === 'function') {
          onDel = type;
          type = 'primaryEmailChanged';
        }
        return {
          event: type,
          uid: UID,
          del: onDel,
        };
      }
      beforeEach(function() {
        Server.server.methods.profileCache.drop = sinon.spy(function(uid, cb) {
          cb();
        });
      });

      it('invalidate cache', function(done) {
        events.onData(
          new Message(function() {
            var args = Server.server.methods.profileCache.drop.getCall(0).args;
            var callCount = Server.server.methods.profileCache.drop.callCount;
            assert.equal(callCount, 1);
            assert.equal(args.length, 2);
            assert.equal(args[0], UID);
            assert.equal(typeof args[1] === 'function', true);
            done();
          })
        );
      });
    });

    describe('should delete message on invalid uid', function() {
      function Message(type, onDel) {
        if (typeof type === 'function') {
          onDel = type;
          type = 'primaryEmailChanged';
        }
        return {
          event: type,
          uid: 'notahexuid',
          del: onDel,
        };
      }

      it('invalid uid', function(done) {
        events.onData(
          new Message(function() {
            assert(true, 'message.del() should be called');
          })
        );

        mock.log('events', function(record) {
          if (record.levelname === 'WARN' && record.args[0] === 'getUserId') {
            assert.equal(record.args[1].userId, 'notahexuid');
            setTimeout(function() {
              done();
            }, 1);
            return true;
          }
          return false;
        });
      });
    });
  });

  describe('onProfileDataChanged', function() {
    describe('should invalidate user cache', function() {
      function Message(type, onDel) {
        if (typeof type === 'function') {
          onDel = type;
          type = 'profileDataChanged';
        }
        return {
          event: type,
          uid: UID,
          del: onDel,
        };
      }
      beforeEach(function() {
        Server.server.methods.profileCache.drop = sinon.spy(function(uid, cb) {
          cb();
        });
      });

      it('invalidate cache', function(done) {
        events.onData(
          new Message(function() {
            var args = Server.server.methods.profileCache.drop.getCall(0).args;
            var callCount = Server.server.methods.profileCache.drop.callCount;
            assert.equal(callCount, 1);
            assert.equal(args.length, 2);
            assert.equal(args[0], UID);
            assert.equal(typeof args[1] === 'function', true);
            done();
          })
        );
      });
    });

    describe('should delete message on invalid uid', function() {
      function Message(type, onDel) {
        if (typeof type === 'function') {
          onDel = type;
          type = 'profileDataChanged';
        }
        return {
          event: type,
          uid: 'notahexuid',
          del: onDel,
        };
      }

      it('invalid uid', function(done) {
        events.onData(
          new Message(function() {
            assert(true, 'message.del() should be called');
          })
        );

        mock.log('events', function(record) {
          if (record.levelname === 'WARN' && record.args[0] === 'getUserId') {
            assert.equal(record.args[1].userId, 'notahexuid');
            setTimeout(function() {
              done();
            }, 1);
            return true;
          }
          return false;
        });
      });
    });
  });
});

after(() => {
  return db._teardown();
});
