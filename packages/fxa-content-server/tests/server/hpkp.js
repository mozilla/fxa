/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const config = require('../../server/lib/configuration');
const hpkp = require('../../server/lib/hpkp');
var suite = {
  tests: {}
};

function ReqMock() {
  this.headers = {
    'user-agent': '"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:40.0) Gecko/20100101 Firefox/40.0'
  };
  this.method = 'GET';
  this.path = '/';
}

function ResMock() {
  this.headers = {};
}

ResMock.prototype = {
  setHeader: function (name, value) {
    this.headers[name.toLowerCase()] = value;
  }
};

suite.tests['#fails with no sha pins'] = function () {
  config.set('hpkp.sha256s', []);
  assert.throws(function () {
    hpkp(config);
  }, 'hpkp must be called with a maxAge and at least two SHA-256s (one actually used and another kept as a backup).');
};


suite.tests['#sends header when enabled'] = function () {
  config.set('hpkp.enabled', true);
  config.set('hpkp.sha256s', ['sha1=', 'sha2=']);
  config.set('hpkp.reportOnly', false);
  config.set('hpkp.maxAge', 100);
  var middleware = hpkp(config);
  var dfd = this.async(intern._config.asyncTimeout);

  var res = new ResMock();
  var req = new ReqMock();
  middleware(req, res, dfd.callback(function () {
    assert.equal(res.headers['public-key-pins'], 'pin-sha256="sha1="; pin-sha256="sha2="; max-age=100; includeSubDomains');
  }, dfd.reject.bind(dfd)));
};

suite.tests['#does not send header when disabled'] = function () {
  config.set('hpkp.enabled', false);
  var middleware = hpkp(config);
  var dfd = this.async(intern._config.asyncTimeout);

  var res = new ResMock();
  var req = new ReqMock();
  middleware(req, res, dfd.callback(function () {
    assert.notProperty(res.headers, 'public-key-pins');
    assert.notProperty(res.headers, 'public-key-pins-report-only');
  }, dfd.reject.bind(dfd)));
};

suite.tests['#sends report only header'] = function () {
  config.set('hpkp.enabled', true);
  config.set('hpkp.reportOnly', true);
  config.set('hpkp.reportUri', 'http://report.com');
  var middleware = hpkp(config);
  var dfd = this.async(intern._config.asyncTimeout);

  var res = new ResMock();
  var req = new ReqMock();
  middleware(req, res, dfd.callback(function () {
    var expectedValue = 'pin-sha256="sha1="; pin-sha256="sha2="; max-age=100; includeSubDomains; report-uri="http://report.com"';
    assert.equal(res.headers['public-key-pins-report-only'], expectedValue);
    assert.notProperty(res.headers, 'public-key-pins');
  }, dfd.reject.bind(dfd)));
};

registerSuite('hpkp', suite);
