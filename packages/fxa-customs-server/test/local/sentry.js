/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict';

const { assert } = require('chai');
const { test } = require('tap');
const sinon = require('sinon');
const Hapi = require('@hapi/hapi');
const Sentry = require('@sentry/node');

const config = require('../../lib/config').getProperties();
const configureSentry = require('../../lib/sentry').configureSentry;

const sandbox = sinon.createSandbox();
const log = {
  info: () => {},
  error: () => {},
};

let server;

test('Sentry emits error', async () => {
  server = new Hapi.Server({});
  config.sentryDsn = 'https://deadbeef:deadbeef@localhost/123';

  await configureSentry(server, config, log);

  const sentryCaptureSpy = sandbox.stub(Sentry, 'captureException');
  const scopeExtraSpy = sinon.fake();
  const scopeSpy = {
    addEventProcessor: sinon.fake(),
    setExtra: scopeExtraSpy,
  };
  sandbox.replace(Sentry, 'withScope', fn => fn(scopeSpy));
  const fullError = new Error('something went wrong');
  await server.events.emit({ name: 'request', channel: 'error' }, [
    {},
    { error: fullError },
  ]);

  sentryCaptureSpy.calledOnceWith(fullError);
  assert.equal(scopeExtraSpy.calledOnce, true);
});
