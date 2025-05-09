/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { registerSuite } = intern.getInterface('object');
const { expect, use } = require('chai');
const sinonChai = require('sinon-chai');
const { readFileSync } = require('fs');
const { resolve } = require('path');
const { mockRes } = require('sinon-express-mock');
const {
  swapBetaMeta,
  modifyProxyRes,
  settingsConfig,
} = require('../../server/lib/beta-settings');

use(sinonChai.default);

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
      removeHeader: function () {},
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
      const config = {
        kenny: 'spenny',
        sentry: { dsn: 'https://00000000.ingest.sentry.io/0000000' },
        servers: {
          gql: {
            url: 'https://graphql.accounts.firefox.com/',
          },
          auth: {
            url: 'https://api.accounts.firefox.com',
          },
          oauth: {
            url: 'https://api.accounts.firefox.com',
          },
          profile: {
            url: 'https://api.accounts.firefox.com',
          },
        },
      };
      const encodedConfig = encodeURIComponent(JSON.stringify(config));

      const result = swapBetaMeta(dummyHtml, {
        __SERVER_CONFIG__: config,
        __GQL_URL_PRECONNECT__: `<link rel="preconnect" href="${config.servers.gql.url}">`,
        __AUTH_URL_PRECONNECT__: `<link rel="preconnect" href="${config.servers.auth.url}">`,
        __OAUTH_URL_PRECONNECT__: `<link rel="preconnect" href="${config.servers.oauth.url}">`,
        __SENTRY_URL_PRECONNECT__: `<link rel="preconnect" href="${config.sentry.dsn.replace(/sentry.io.*/, 'sentry.io')}">`,
      });

      expect(result).to.contain(encodedConfig);
      expect(result).to.contain(
        `<link rel="preconnect" href="${config.servers.gql.url}">`
      );
      expect(result).to.contain(
        `<link rel="preconnect" href="${config.servers.auth.url}">`
      );
      expect(result).to.contain(
        `<link rel="preconnect" href="${config.servers.oauth.url}">`
      );
      expect(result).to.contain(
        `<link rel="preconnect" href="${config.sentry.dsn.replace(/sentry.io.*/, 'sentry.io')}">`
      );
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
        __TRACE_PARENT__: '00-0-0-00',
        __TRACE_STATE__: '',
        __GQL_URL_PRECONNECT__: `<link rel="preconnect" href="${settingsConfig.servers.gql.url}">`,
        __AUTH_URL_PRECONNECT__: `<link rel="preconnect" href="${settingsConfig.servers.auth.url}">`,
        __OAUTH_URL_PRECONNECT__: ``,
        __SENTRY_URL_PRECONNECT__: ``,
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
    'does not include invalid flow id': function () {
      const proxyingResponse = mockedResponse(dummyHtml, {
        'content-type': 'text/html',
      });
      const proxiedResponse = mockRes(responseOptions);
      modifyProxyRes(
        proxyingResponse,
        { query: { flowId: 'LOLNOPE' } },
        proxiedResponse
      );
      proxyingResponse.send(dummyHtml);

      expect(`${proxiedResponse.send.args[0][0]}`.includes('LOLNOPE')).to.be
        .false;
    },
  },
});
