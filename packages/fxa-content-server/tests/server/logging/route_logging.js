/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!path',
  'intern/dojo/node!proxyquire',
  'intern/dojo/node!sinon'
], function (registerSuite, assert, path, proxyquire, sinon) {

  var routeLogging;
  var loggerSpy;
  var configSpy;
  var morganSpy;

  const tokens = {
    method: () => 'GET',
    res: () => '1995',
    status: () => '200',
    url: () => 'www.mozilla.com',
    'response-time': () => '1337',
  };

  const req = {
    headers: {
      referer: 'testReferer',
      'user-agent': 'testAgent'
    },
    ip: '127.0.0.1'
  };

  function requireTestFile() {
    routeLogging = proxyquire(
      path.join(process.cwd(), 'server', 'lib', 'logging', 'route_logging'),
      {
        '../configuration': {
          get: configSpy
        },
        'mozlog': function() {
          return {
            info: loggerSpy
          };
        },
        'morgan': morganSpy
      }
    );
  }

  var suite = {
    name: 'routeLogging',
    beforeEach: () => {
      loggerSpy = sinon.stub();
      configSpy = sinon.stub();
      morganSpy = sinon.stub();
      configSpy.withArgs('disable_route_logging').returns(false);
    },

    'it logs a string if log format is dev_fxa' () {
      configSpy.withArgs('route_log_format').returns('dev_fxa');
      requireTestFile();
      routeLogging();
      const formatObj = morganSpy.getCall(0).args[0];
      const writeFunct = morganSpy.getCall(0).args[1].stream.write;

      const formatObjResp = formatObj(tokens);
      assert.equal(formatObjResp, 'GET www.mozilla.com 1337 200');

      writeFunct('    spaceToTrim\n');
      assert.equal(loggerSpy.getCall(0).args[0], 'route');
      assert.equal(loggerSpy.getCall(0).args[1], 'spaceToTrim');
    },

    'it logs a json blob if log format is not dev_fxa' () {
      configSpy.withArgs('route_log_format').returns('default_fxa');
      requireTestFile();
      routeLogging();
      const formatObj = morganSpy.getCall(0).args[0];
      const writeFunct = morganSpy.getCall(0).args[1].stream.write;
      const formatObjResp = formatObj(tokens, req);
      assert.equal(
        formatObjResp,
        JSON.stringify({
          contentLength: '1995',
          method: 'GET',
          path: 'www.mozilla.com',
          referer: 'testReferer',
          remoteAddressChain: '127.0.0.1',
          status: '200',
          t: '1337',
          'userAgent': 'testAgent'
        })
      );

      writeFunct('{"p": 5}');
      assert.equal(loggerSpy.getCall(0).args[0], 'route');
      assert.deepEqual(loggerSpy.getCall(0).args[1], {p: 5});
    }
  };


  registerSuite(suite);
});
