/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('insist');

const Server = require('./lib/server');

/*global describe,it*/

describe('server', function() {

  describe('/', function() {
    it('should return the version', function() {
      return Server.get('/').then(function(res) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.result.version, require('../package.json').version);
        assert(res.result.commit);
      });
    });
  });

  describe('/__heartbeat__', function() {
    it('should succeed', function() {
      return Server.get('/__heartbeat__').then(function(res) {
        assert.equal(res.statusCode, 200);
      });
    });
  });
});

