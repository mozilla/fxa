/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('insist');

/*global describe,it,beforeEach*/

function clearRequireCache() {
  // Delete require cache so that correct configuration values get injected when
  // recreating server
  delete require.cache[require.resolve('../lib/config')];
  delete require.cache[require.resolve('../lib/server')];
}

describe('HPKP', function () {
  // Since this test starts/stops servers to test different configs
  // the timeout needs to be upped
  this.timeout(5000);

  var Server;
  var requestOptions = {
    method: 'GET',
    url: '/'
  };

  describe('enabled', function () {
    beforeEach(function () {
      process.env.HPKP_ENABLE = true;
      process.env.HPKP_PIN_SHA256 = ['orlando=', 'magic='];
      process.env.HPKP_MAX_AGE = 1;

      clearRequireCache();
    });

    it('should set report header', function (done) {
      process.env.HPKP_REPORT_ONLY = false;
      Server = require('../lib/server').create();
      Server.inject(requestOptions).then(function (res) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.headers['public-key-pins'], 'pin-sha256="orlando="; pin-sha256="magic="; max-age=1; includeSubdomains');
        done();
      }).catch(done);
    });

    it('should set report-only header', function (done) {
      process.env.HPKP_REPORT_ONLY = true;
      Server = require('../lib/server').create();
      Server.inject(requestOptions).then(function (res) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.headers['public-key-pins-report-only'], 'pin-sha256="orlando="; pin-sha256="magic="; max-age=1; includeSubdomains');
        done();
      }).catch(done);
    });
  });

  describe('disabled', function () {
    it('should set no header', function (done) {
      process.env.HPKP_ENABLE = false;

      clearRequireCache();
      Server = require('../lib/server').create();
      Server.inject(requestOptions).then(function (res) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.headers['public-key-pins'], undefined);
        assert.equal(res.headers['public-key-pins-report-only'], undefined);
        done();
      }).catch(done);
    });
  });
});
