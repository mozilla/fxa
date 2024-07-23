/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { registerSuite } = intern.getInterface('object');
const proxyquire = require('proxyquire');
const assert = intern.getPlugin('chai').assert;
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();
const accountEventsLoggerStub = sandbox.stub();
const createAccountsEventsEventStub = sandbox
  .stub()
  .returns({ record: accountEventsLoggerStub });
const recordRelyingPartyFormViewStub = sandbox.stub();
const createEventsServerEventLoggerStub = sandbox
  .stub()
  .returns({ recordRelyingPartyFormView: recordRelyingPartyFormViewStub });

const serverGlean = proxyquire('../../server/lib/glean', {
  './server_events': {
    createAccountsEventsEvent: createAccountsEventsEventStub,
    createEventsServerEventLogger: createEventsServerEventLoggerStub,
  },
  'fxa-shared/express/remote-address': {
    remoteAddress: () => () => ({ clientAddress: '10.10.10.99' }),
  },
});

const config = {
  serverGleanMetrics: {
    enabled: true,
    applicationId: 'cool-app-and-a-half',
    channel: 'wibble',
    loggerAppName: 'quux',
  },
  version: '9001',
  oauth_client_id_map: {},
};

const request = {
  headers: {
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0',
    'x-forwarded-for': '10.10.10.10',
  },
};

const suite = {
  tests: {},
};

suite.beforeEach = () => {
  sandbox.resetHistory();
};

suite.tests['initialized with the given config'] = () => {
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

suite.tests['set default values to empty strings'] = () => {
  const glean = serverGlean(config);
  glean.rp.formView(request, { reason: 'testo' });
  const metricsArg = accountEventsLoggerStub.args[0][0];
  assert.equal(metricsArg.account_user_id_sha256, '');
  assert.equal(metricsArg.relying_party_oauth_client_id, '');
  assert.equal(metricsArg.relying_party_service, '');
  assert.equal(metricsArg.session_device_type, '');
  assert.equal(metricsArg.session_entrypoint, '');
  assert.equal(metricsArg.session_entrypoint_experiment, '');
  assert.equal(metricsArg.session_entrypoint_variation, '');
  assert.equal(metricsArg.session_flow_id, '');
  assert.equal(metricsArg.utm_campaign, '');
  assert.equal(metricsArg.utm_content, '');
  assert.equal(metricsArg.utm_medium, '');
  assert.equal(metricsArg.utm_source, '');
  assert.equal(metricsArg.utm_term, '');
};

suite.tests['set common metrics'] = () => {
  const glean = serverGlean({
    ...config,
    oauth_client_id_map: { 1212: 'wibble' },
  });
  const req = {
    ...request,
    headers: {
      ...request.headers,
      'user-agent':
        'Mozilla/5.0 (Android 7.1.2; Mobile; rv:56.0) Gecko/56.0 Firefox/56.0',
    },
    query: {
      service: '1212',
      entrypoint: 'worldwideweb',
      entrypoint_experiment: 'quux',
      entrypoint_variation: 'foo',
      utm_campaign: 'bar',
      utm_content: 'baz',
      utm_medium: 'fizz',
      utm_source: 'buzz',
      utm_term: 'xyzzy',
    },
  };
  glean.rp.formView(req, { flowId: 'a0a0a0', reason: 'testo' });
  const metricsArg = accountEventsLoggerStub.args[0][0];
  assert.equal(metricsArg.user_agent, req.headers['user-agent']);
  assert.equal(metricsArg.ip_address, '10.10.10.99');
  assert.equal(metricsArg.account_user_id_sha256, '');
  assert.equal(metricsArg.relying_party_oauth_client_id, '1212');
  assert.equal(metricsArg.relying_party_service, 'wibble');
  assert.equal(metricsArg.session_device_type, 'mobile');
  assert.equal(metricsArg.session_entrypoint, 'worldwideweb');
  assert.equal(metricsArg.session_entrypoint_experiment, 'quux');
  assert.equal(metricsArg.session_entrypoint_variation, 'foo');
  assert.equal(metricsArg.session_flow_id, 'a0a0a0');
  assert.equal(metricsArg.utm_campaign, 'bar');
  assert.equal(metricsArg.utm_content, 'baz');
  assert.equal(metricsArg.utm_medium, 'fizz');
  assert.equal(metricsArg.utm_source, 'buzz');
  assert.equal(metricsArg.utm_term, 'xyzzy');
};

suite.tests['log relying_party_form_view pings'] = () => {
  const glean = serverGlean(config);
  glean.rp.formView(request, { reason: 'testo' });
  sinon.assert.calledOnce(accountEventsLoggerStub);
  const metricsArg = accountEventsLoggerStub.args[0][0];
  assert.equal(metricsArg.event_name, 'relying_party_form_view');
  assert.equal(metricsArg.event_reason, 'testo');
  sinon.assert.calledOnce(recordRelyingPartyFormViewStub);
  const eventArg = recordRelyingPartyFormViewStub.args[0][0];
  assert.equal(eventArg.type, 'testo');
};

registerSuite('glean', suite);
