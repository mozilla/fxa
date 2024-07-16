/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { registerSuite } = intern.getInterface('object');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();
const createAccountsEventsEventStub = sandbox.stub();
const createEventsServerEventLoggerStub = sandbox.stub();

const serverGlean = proxyquire('../../server/lib/glean', {
  './server_events': {
    createAccountsEventsEvent: createAccountsEventsEventStub,
    createEventsServerEventLogger: createEventsServerEventLoggerStub,
  },
});

const suite = {
  tests: {},
};

suite.beforeEach = () => {
  sandbox.reset();
};

suite.tests['initialized with the given config'] = () => {
  const config = {
    serverGleanMetrics: {
      applicationId: 'cool-app-and-a-half',
      channel: 'wibble',
      loggerAppName: 'quux',
    },
    version: '9001',
  };
  serverGlean(config);
  sinon.assert.calledOnce(createAccountsEventsEventStub);
  sinon.assert.calledWithExactly(createAccountsEventsEventStub, {
    applicationId: config.serverGleanMetrics.applicationId,
    appDisplayVersion: config.version,
    channel: config.serverGleanMetrics.channel,
    logger_options: { app: config.serverGleanMetrics.loggerAppName },
  });
  sinon.assert.calledOnce(createEventsServerEventLoggerStub);
  sinon.assert.calledWithExactly(createEventsServerEventLoggerStub, {
    applicationId: config.serverGleanMetrics.applicationId,
    appDisplayVersion: config.version,
    channel: config.serverGleanMetrics.channel,
    logger_options: { app: config.serverGleanMetrics.loggerAppName },
  });
};

registerSuite('glean', suite);
