/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('assert');
const url = require('url');

const mkdirp = require('mkdirp');
const _nock = require('nock');
const through = require('through');

const config = require('../../lib/config');
mkdirp.sync(config.get('img.uploads.dest.public'));
const local = new (require('../../lib/img/local'))();
const inject = require('./inject');
const WORKER = require('../../lib/server/worker').create();

const IS_AWS = config.get('img.driver') === 'aws';
//const IS_LOCAL = config.get('img.driver') === 'local';


module.exports = function mock(options) {
  assert(options.userid);
  var TOKEN_GOOD = JSON.stringify({
    user: options.userid,
    scope: ['profile'],
    email: 'user@example.domain'
  });

  const MOCK_ID = new Array(33).join('f');

  var outstandingMocks = [];

  function nock() {
    var scope = _nock.apply(_nock, arguments);
    outstandingMocks.push(scope);
    return scope;
  }

  function worker() {
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


  function uploadAws() {
    var bucket = config.get('img.uploads.dest.public');
    var u = '/' + bucket + '/XXX';
    var id;
    return nock('https://s3.amazonaws.com')
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
  }

  function deleteAws() {
    var bucket = config.get('img.uploads.dest.public');
    var u = '/' + bucket + '?delete';
    return nock('https://s3.amazonaws.com')
      .post(u)
      .reply(200, function(uri, body) {
        var id = body.match(/<Key>([0-9a-f]{32})<\/Key>/)[1];
        var s = through();
        s.setEncoding = function() {};
        local.delete(id).done(function() {
          s.end();
        });
        return s;
      });
  }


  return {

    done: function done() {
      outstandingMocks.forEach(function(mock) { mock.done(); });
      outstandingMocks = [];
    },

    tokenGood: function tokenGood() {
      var parts = url.parse(config.get('oauth.url'));
      return nock(parts.protocol + '//' + parts.host)
        .post(parts.path + '/verify')
        .reply(200, TOKEN_GOOD);
    },

    token: function token(tok) {
      var parts = url.parse(config.get('oauth.url'));
      return nock(parts.protocol + '//' + parts.host)
        .post(parts.path + '/verify')
        .reply(200, JSON.stringify(tok));
    },

    workerFailure: function workerFailure() {
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
        .reply(500, 'unexpected server error');

    },

    image: function image() {
      worker();
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
            url: path
          });
        });

      if (IS_AWS) {
        deleteAws();
      }
    },

    log: function mockLog(logger, cb) {
      var log = require('../../lib/logging')(logger);
      var isDone = false;
      var filter = {
        filter: function(record) {
          if (cb(record)) {
            isDone = true;
            log.removeFilter(filter);
            return false;
          }
          return true;
        }
      };
      log.addFilter(filter);
      outstandingMocks.push({
        done: function done() {
          assert(isDone, 'Mocked logger never called: ' + logger);
        }
      });
    }
  };
};
