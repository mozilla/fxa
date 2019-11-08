/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable indent */
const assert = require('assert');
const url = require('url');

const mkdirp = require('mkdirp');
const _nock = require('nock');
const through = require('through');

const config = require('../../lib/config');
mkdirp.sync(config.get('img.uploads.dest.public'));
// eslint-disable-next-line space-unary-ops
const local = new (require('../../lib/img/local'))();
const inject = require('./inject');
const WORKER = require('../../lib/server/worker').create();

const IS_AWS = config.get('img.driver') === 'aws';

const SIZES = require('../../lib/img').SIZES;

module.exports = function mock(options) {
  assert(options.userid);
  const TOKEN_GOOD = JSON.stringify({
    user: options.userid,
    scope: ['profile'],
  });

  const MOCK_ID = new Array(33).join('f');

  var outstandingMocks = [];

  function nock() {
    var scope = _nock.apply(_nock, arguments);
    outstandingMocks.push(scope);
    return scope;
  }

  function worker(bytes) {
    if (bytes == null) {
      throw new Error('Content-Length argument required');
    }
    var parts = url.parse(config.get('worker.url'));
    var path = '';
    var headers = {
      'content-type': 'image/png',
      'content-length': '' + bytes,
    };
    return nock(parts.protocol + '//' + parts.host, {
      reqheaders: headers,
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
          payload: Buffer.from(body, 'hex'),
          headers: headers,
        });
      });
  }

  function uploadAws() {
    var bucket = config.get('img.uploads.dest.public');
    Object.keys(SIZES).forEach(function() {
      var u = '/' + bucket + '/XXX';
      var id;
      nock('https://s3.amazonaws.com')
        .filteringPath(function filter(_path) {
          id = _path.replace('/' + bucket + '/', '');
          return _path.replace(id, 'XXX');
        })
        .put(u)
        .reply(200, function(uri, body) {
          var s = through();
          s.setEncoding = function() {};
          local.upload(id, body).done(function() {
            s.end();
          });
          return s;
        });
    });
  }

  function deleteAws() {
    var bucket = config.get('img.uploads.dest.public');
    var u = '/' + bucket + '?delete';
    Object.keys(SIZES).forEach(function() {
      nock('https://s3.amazonaws.com')
        .post(u)
        .reply(200, function(uri, body) {
          // eslint-disable-next-line no-useless-escape
          var id = body.match(/<Key>([0-9a-z-A-Z_\-]+)<\/Key>/)[1];
          var s = through();
          s.setEncoding = function() {};
          local.delete(id).done(function() {
            s.end();
          });
          return s;
        });
    });
  }

  return {
    done: function done() {
      outstandingMocks.forEach(function(mock) {
        mock.done();
      });
      outstandingMocks = [];
    },

    tokenGood: function tokenGood() {
      var parts = url.parse(config.get('oauth.url'));
      return nock(parts.protocol + '//' + parts.host)
        .post(parts.path + '/verify', function(body) {
          return body.email === false;
        })
        .reply(200, TOKEN_GOOD);
    },

    token: function token(tok) {
      var parts = url.parse(config.get('oauth.url'));
      return nock(parts.protocol + '//' + parts.host)
        .post(parts.path + '/verify', function(body) {
          return body.email === false;
        })
        .reply(200, JSON.stringify(tok));
    },

    tokenFailure: function tokenFailure() {
      var parts = url.parse(config.get('oauth.url'));
      return nock(parts.protocol + '//' + parts.host)
        .post(parts.path + '/verify')
        .reply(500);
    },

    email: function mockEmail(email) {
      var parts = url.parse(config.get('authServer.url'));
      return nock(parts.protocol + '//' + parts.host)
        .get(parts.path + '/account/profile')
        .reply(200, {
          email: email,
        });
    },

    subscriptions: function mockSubscriptions(subscriptions) {
      var parts = url.parse(config.get('authServer.url'));
      return nock(parts.protocol + '//' + parts.host)
        .get(parts.path + '/account/profile')
        .reply(200, { subscriptions });
    },

    profileChangedAt: function mockProfileChangedAt(email, profileChangedAt) {
      var parts = url.parse(config.get('authServer.url'));
      return nock(parts.protocol + '//' + parts.host)
        .get(parts.path + '/account/profile')
        .reply(200, {
          email: email,
          profileChangedAt,
        });
    },

    emailFailure: function mockEmailFailure(body) {
      body = body || {};
      var parts = url.parse(config.get('authServer.url'));
      return nock(parts.protocol + '//' + parts.host)
        .get(parts.path + '/account/profile')
        .reply(body.code || 500, body);
    },

    coreProfile: function mockEmail(body) {
      const parts = url.parse(config.get('authServer.url'));
      return nock(parts.protocol + '//' + parts.host)
        .get(parts.path + '/account/profile')
        .reply(200, body);
    },

    workerFailure: function workerFailure(action, bytes, response) {
      if (action !== 'post' && action !== 'delete') {
        throw new Error('failure must be post or delete');
      }
      if (bytes == null) {
        throw new Error('Content-Length argument required');
      }
      var parts = url.parse(config.get('worker.url'));
      var headers =
        action === 'post'
          ? {
              'content-type': 'image/png',
              'content-length': '' + bytes,
            }
          : {};
      return nock(parts.protocol + '//' + parts.host, {
        reqheaders: headers,
      })
        .filteringPath(/^\/a\/[0-9a-f]{32}$/g, '/a/' + MOCK_ID)
        [action]('/a/' + MOCK_ID) // eslint-disable-line no-unexpected-multiline
        .reply(500, response || 'unexpected server error');
    },

    image: function image(bytes) {
      worker(bytes);
      if (IS_AWS) {
        uploadAws();
      }
    },

    deleteImage: function deleteImage() {
      var parts = url.parse(config.get('worker.url'));
      var path = '';
      nock(parts.protocol + '//' + parts.host)
        .filteringPath(function filter(_path) {
          path = _path;
          return _path.replace(/\/a\/[0-9a-f]{32}/g, '/a/' + MOCK_ID);
        })
        .delete('/a/' + MOCK_ID)
        .reply(200, function() {
          return inject(WORKER, {
            method: 'DELETE',
            url: path,
          });
        });

      if (IS_AWS) {
        deleteAws();
      }
    },

    log: function mockLog(logger, cb) {
      var root = require('../../lib/logging')();
      var log = require('../../lib/logging')(logger);
      log.setLevel('verbose');
      var isDone = false;
      var filter = {
        filter: function(record) {
          if (cb(record)) {
            isDone = true;
            log.removeFilter(filter);
            log.setLevel(root.getEffectiveLevel());
            return false;
          }
          return true;
        },
      };
      log.addFilter(filter);
      outstandingMocks.push({
        done: function done() {
          assert(isDone, 'Mocked logger never called: ' + logger);
        },
      });
    },
  };
};
