/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/**
 * Ensure the x-frame-options headers are added to the
 * appropriate requests
 */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const path = require('path');
const proxyquire = require('proxyquire');

const frameguard = proxyquire(
  path.join(process.cwd(), 'server', 'lib', 'frame-guard'),
  {
    // totally ignore the html-middleware
    './html-middleware': callback => callback
  }
);

var config = {
  get: function (key) {
    if (key === 'allowed_iframe_contexts') {
      return ['fx_firstrun_v2', 'iframe'];
    } else if (key === 'allowed_parent_origins') {
      return ['http://allowed.site', 'http://another.allowed.site'];
    }
  }
};

var middleware = frameguard(config);

function testXFrameOptionsHeader(context, req, res, expectedValue) {
  var dfd = context.async(intern._config.asyncTimeout);

  middleware(req, res, dfd.callback(function () {
    assert.equal(res.headers['x-frame-options'], expectedValue);
  }, dfd.reject.bind(dfd)));
}

function ReqMock () {
  this.headers = {
    'user-agent': '"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:40.0) Gecko/20100101 Firefox/40.0'
  };
  this.method = 'GET';
  this.path = '/';
  this.query = {
    context: 'iframe',
    origin: 'http://allowed.site',
    service: 'sync'
  };
}

function ResMock () {
  this.headers = {};
}
ResMock.prototype = {
  setHeader: function (name, value) {
    this.headers[name.toLowerCase()] = value;
  }
};

var suite = {
  tests: {}
};

suite.tests['no user-agent header'] = function () {
  var req = new ReqMock();
  delete req.headers['user-agent'];

  var res = new ResMock();

  testXFrameOptionsHeader(this, req, res, 'DENY');
};

suite.tests['Firefox Desktop < 40'] = function () {
  var req = new ReqMock();
  req.headers['user-agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:39.0) Gecko/20100101 Firefox/39.0';

  var res = new ResMock();

  testXFrameOptionsHeader(this, req, res, 'DENY');
};

suite.tests['Fennec'] = function () {
  var req = new ReqMock();
  req.headers['user-agent'] = 'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0';

  var res = new ResMock();

  testXFrameOptionsHeader(this, req, res, 'DENY');
};

suite.tests['Firefox for iOS'] = function () {
  var req = new ReqMock();
  req.headers['user-agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4'; //eslint-disable-line max-len

  var res = new ResMock();

  testXFrameOptionsHeader(this, req, res, 'DENY');
};

suite.tests['Firefox OS'] = function () {
  var req = new ReqMock();
  req.headers['user-agent'] = 'Mozilla/5.0 (Mobile; rv:26.0) Gecko/26.0 Firefox/26.0';

  var res = new ResMock();

  testXFrameOptionsHeader(this, req, res, 'DENY');
};

suite.tests['Chrome'] = function () {
  var req = new ReqMock();
  req.headers['user-agent'] = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36'; //eslint-disable-line max-len

  var res = new ResMock();

  testXFrameOptionsHeader(this, req, res, 'DENY');
};

suite.tests['no origin specified'] = function () {
  var req = new ReqMock();
  delete req.query.origin;

  var res = new ResMock();

  testXFrameOptionsHeader(this, req, res, 'DENY');
};

suite.tests['origin not in the allowed list'] = function () {
  var req = new ReqMock();
  req.query.origin = 'http://site.not.allowed';

  var res = new ResMock();

  testXFrameOptionsHeader(this, req, res, 'DENY');
};

suite.tests['no service specified'] = function () {
  var req = new ReqMock();
  delete req.query.service;

  var res = new ResMock();

  testXFrameOptionsHeader(this, req, res, 'DENY');
};

suite.tests['service !== sync'] = function () {
  var req = new ReqMock();
  req.query.service = 'oauth';

  var res = new ResMock();

  testXFrameOptionsHeader(this, req, res, 'DENY');
};

suite.tests['allowed.site, Fx Desktop >= 40'] = function () {
  var req = new ReqMock();
  var res = new ResMock();

  testXFrameOptionsHeader(this, req, res, 'ALLOW-FROM http://allowed.site');
};

suite.tests['another.allowed.site, Fx Desktop >= 40'] = function () {
  var req = new ReqMock();
  req.query.origin = 'http://another.allowed.site';

  var res = new ResMock();

  testXFrameOptionsHeader(this, req, res, 'ALLOW-FROM http://another.allowed.site');
};

registerSuite('frame-guard', suite);
