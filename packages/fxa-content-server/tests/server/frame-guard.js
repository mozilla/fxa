/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Ensure the x-frame-options headers are added to the
 * appropriate requests
 */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/frame-guard'
], function (intern, registerSuite, assert, frameguard) {

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
    var dfd = context.async(intern.config.asyncTimeout);

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
    name: 'frame-guard'
  };

  suite['isFrameGuardRequired'] = function () {
    assert.isFalse(frameguard.isFrameGuardRequired({ method: 'POST', path: '/frameguard_report' }));
    assert.isFalse(frameguard.isFrameGuardRequired({ method: 'GET', path: '/lib/router.js' }));
    assert.isFalse(frameguard.isFrameGuardRequired({ method: 'GET', path: '/images/firefox.png' }));
    assert.isFalse(frameguard.isFrameGuardRequired({ method: 'GET', path: '/fonts/clearsans.woff' }));

    assert.isTrue(frameguard.isFrameGuardRequired({ method: 'GET', path: '/404.html' }));
    assert.isTrue(frameguard.isFrameGuardRequired({ method: 'GET', path: '/' }));
    assert.isTrue(frameguard.isFrameGuardRequired({ method: 'GET', path: '/confirm' }));
  };

  suite['no user-agent header'] = function () {
    var req = new ReqMock();
    delete req.headers['user-agent'];

    var res = new ResMock();

    testXFrameOptionsHeader(this, req, res, 'DENY');
  };

  suite['Firefox Desktop < 40'] = function () {
    var req = new ReqMock();
    req.headers['user-agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:39.0) Gecko/20100101 Firefox/39.0';

    var res = new ResMock();

    testXFrameOptionsHeader(this, req, res, 'DENY');
  };

  suite['Fennec'] = function () {
    var req = new ReqMock();
    req.headers['user-agent'] = 'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0';

    var res = new ResMock();

    testXFrameOptionsHeader(this, req, res, 'DENY');
  };

  suite['Firefox for iOS'] = function () {
    var req = new ReqMock();
    req.headers['user-agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4'; //eslint-disable-line max-len

    var res = new ResMock();

    testXFrameOptionsHeader(this, req, res, 'DENY');
  };

  suite['Firefox OS'] = function () {
    var req = new ReqMock();
    req.headers['user-agent'] = 'Mozilla/5.0 (Mobile; rv:26.0) Gecko/26.0 Firefox/26.0';

    var res = new ResMock();

    testXFrameOptionsHeader(this, req, res, 'DENY');
  };

  suite['Chrome'] = function () {
    var req = new ReqMock();
    req.headers['user-agent'] = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36'; //eslint-disable-line max-len

    var res = new ResMock();

    testXFrameOptionsHeader(this, req, res, 'DENY');
  };

  suite['no origin specified'] = function () {
    var req = new ReqMock();
    delete req.query.origin;

    var res = new ResMock();

    testXFrameOptionsHeader(this, req, res, 'DENY');
  };

  suite['origin not in the allowed list'] = function () {
    var req = new ReqMock();
    req.query.origin = 'http://site.not.allowed';

    var res = new ResMock();

    testXFrameOptionsHeader(this, req, res, 'DENY');
  };

  suite['no service specified'] = function () {
    var req = new ReqMock();
    delete req.query.service;

    var res = new ResMock();

    testXFrameOptionsHeader(this, req, res, 'DENY');
  };

  suite['service !== sync'] = function () {
    var req = new ReqMock();
    req.query.service = 'oauth';

    var res = new ResMock();

    testXFrameOptionsHeader(this, req, res, 'DENY');
  };

  suite['allowed.site, Fx Desktop >= 40'] = function () {
    var req = new ReqMock();
    var res = new ResMock();

    testXFrameOptionsHeader(this, req, res, 'ALLOW-FROM http://allowed.site');
  };

  suite['another.allowed.site, Fx Desktop >= 40'] = function () {
    var req = new ReqMock();
    req.query.origin = 'http://another.allowed.site';

    var res = new ResMock();

    testXFrameOptionsHeader(this, req, res, 'ALLOW-FROM http://another.allowed.site');
  };

  registerSuite(suite);
});

