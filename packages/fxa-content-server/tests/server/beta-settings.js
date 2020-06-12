/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { registerSuite } = intern.getInterface('object');
const { expect, use } = require('chai');
const { readFileSync } = require('fs');
const { resolve } = require('path');
const sinonChai = require('sinon-chai');
const { mockRes } = require('sinon-express-mock');
const {
  swapBetaMeta,
  modifyProxyRes,
  settingsConfig,
} = require('../../server/lib/beta-settings');

use(sinonChai);

const dummyHtml = readFileSync(
  resolve(__dirname, './fixtures/server-config-index.html'),
  { encoding: 'utf8' }
);

const responseOptions = {
  headers: {},
};

function mockedResponse(data = '', headers = {}) {
  return mockRes(
    Object.assign(responseOptions, {
      headers,
      statusCode: 200,
      on(name, callback) {
        const args = [];

        if (name === 'data') {
          args.push(new Buffer.from(data));
        }

        callback(...args);
      },
    })
  );
}

registerSuite('beta settings', {
  tests: {
    'replaces beta meta string with config data': function () {
      const config = { kenny: 'spenny' };
      const encodedConfig = encodeURIComponent(JSON.stringify(config));

      const result = swapBetaMeta(dummyHtml, {
        __SERVER_CONFIG__: config,
      });

      expect(result).to.contain(encodedConfig);
    },
    'proxies the response': function () {
      const headers = { 'x-foo': 'bar' };
      const proxyingResponse = mockedResponse('', headers);
      const proxiedResponse = mockRes(responseOptions);
      modifyProxyRes(proxyingResponse, null, proxiedResponse);
      proxyingResponse.send();

      expect(proxiedResponse.send).to.be.called;
      expect(proxiedResponse.end).to.be.called;
      expect(proxiedResponse.statusCode).to.equal(proxyingResponse.statusCode);
      expect(proxiedResponse.headers).to.equal(headers);
    },
    'modifies the response of html files': function () {
      const proxyingResponse = mockedResponse(dummyHtml, {
        'content-type': 'text/html',
      });
      const proxiedResponse = mockRes(responseOptions);
      modifyProxyRes(proxyingResponse, null, proxiedResponse);
      proxyingResponse.send(dummyHtml);

      const outputHtml = swapBetaMeta(dummyHtml, {
        __SERVER_CONFIG__: settingsConfig,
      });

      expect(proxiedResponse.send).to.be.calledWith(
        new Buffer.from(outputHtml)
      );
    },
    'does not modify the response of non-html files': function () {
      const data = JSON.stringify({ foo: 'bar' });
      const proxyingResponse = mockedResponse(data, {
        'content-type': 'application/json',
      });
      const proxiedResponse = mockRes(responseOptions);
      modifyProxyRes(proxyingResponse, null, proxiedResponse);
      proxyingResponse.send(data);

      expect(proxiedResponse.send).to.be.calledWith(new Buffer.from(data));
    },
  },
});
