/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('insist');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const db = require('../lib/db');
const events = require('../lib/events');
const P = require('../lib/promise');
const assertSecurityHeaders = require('./lib/util').assertSecurityHeaders;

const UID = crypto.randomBytes(16).toString('hex');
const mock = require('./lib/mock')({ userid: UID });
const Server = require('./lib/server');
const Static = require('./lib/static');

const imagePath = path.join(__dirname, 'lib', 'firefox.png');
const imageData = fs.readFileSync(imagePath);

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
        uid: UID + '@accounts.firefox.com',
        del: onDel
      };
    }

    describe('avatar', function() {
      beforeEach(function() {
        mock.token({
          user: UID,
          email: 'user@example.domain',
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
          assertSecurityHeaders(res);
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
          mock.done();
        });
      });

      it('should delete avatars', function(done) {
        mock.deleteImage();
        events.onData(new Message(function() {
          db.getSelectedAvatar(UID).then(function(avatar) {
            assert.equal(avatar, undefined);
          }).done(done, done);
        }));
      });

      it('should not delete message on error', function(done) {
        mock.workerFailure('delete', 0);
        events.onData(new Message(function() {
          assert(false, 'message.del() should not be called');
        }));
        mock.log('events', function(record) {
          if (record.levelname === 'ERROR' && record.args[0] === 'removeUser') {
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
        events.onData(new Message('baz', function() {
          db.getDisplayName(UID).then(function(profile) {
            assert.equal(profile.displayName, 'foo bar');
          }).done(done, done);
        }));
      });
    });

  });
});
