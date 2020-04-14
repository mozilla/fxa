/* eslint-disable camelcase */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const path = require('path');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

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
    'user-agent': 'testAgent',
    'x-forwarded-for': '0.0.0.0, 1.1.1.1, 2.2.2.2',
  },
  ip: 'localhost',
};

function requireTestFile() {
  routeLogging = proxyquire(
    path.join(process.cwd(), 'server', 'lib', 'logging', 'route_logging'),
    {
      '../configuration': {
        getProperties: configSpy,
      },
      './log': function() {
        return {
          info: loggerSpy,
        };
      },
      morgan: morganSpy,
    }
  );
}

var suite = {
  beforeEach: () => {
    loggerSpy = sinon.stub();
    configSpy = sinon.stub();
    morganSpy = sinon.stub();
  },
  tests: {
    'it logs a string if log format is dev_fxa'() {
      configSpy.returns({
        clientAddressDepth: 1,
        disable_route_logging: false,
        route_log_format: 'dev_fxa',
      });
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

    'it logs a json blob if log format is not dev_fxa'() {
      configSpy.returns({
        clientAddressDepth: 1,
        disable_route_logging: false,
        route_log_format: 'default_fxa',
      });
      requireTestFile();
      routeLogging();
      const formatObj = morganSpy.getCall(0).args[0];
      const writeFunct = morganSpy.getCall(0).args[1].stream.write;
      const formatObjResp = formatObj(tokens, req);
      assert.equal(
        formatObjResp,
        JSON.stringify({
          clientAddress: 'localhost',
          contentLength: '1995',
          method: 'GET',
          path: 'www.mozilla.com',
          referer: 'testReferer',
          remoteAddressChain: ['0.0.0.0', '1.1.1.1', '2.2.2.2', 'localhost'],
          status: '200',
          t: '1337',
          userAgent: 'testAgent',
        })
      );

      writeFunct('{"p": 5}');
      assert.equal(loggerSpy.getCall(0).args[0], 'route');
      assert.deepEqual(loggerSpy.getCall(0).args[1], { p: 5 });
    },
  },
};

registerSuite('routeLogging', suite);
