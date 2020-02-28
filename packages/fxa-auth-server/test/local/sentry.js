/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const EndpointError = require('poolee/lib/error')(require('util').inherits);
const sinon = require('sinon');
const verror = require('verror');
const Hapi = require('@hapi/hapi');
const Sentry = require('@sentry/node');

const config = require('../../config').getProperties();
const configureSentry = require('../../lib/sentry').configureSentry;

const sandbox = sinon.createSandbox();

describe('Sentry', () => {
  let server;

  beforeEach(() => {
    server = new Hapi.Server({});
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('can be set up when sentry is enabled', async () => {
    config.sentryDsn = 'https://deadbeef:deadbeef@127.0.0.1/123';
    let throws = false;
    try {
      await configureSentry(server, config);
    } catch (err) {
      throws = true;
    }
    assert.equal(throws, false);
  });

  it('can be set up when sentry is not enabled', async () => {
    let throws = false;
    try {
      await configureSentry(server, config);
    } catch (err) {
      throws = true;
    }
    assert.equal(throws, false);
  });

  it('adds EndpointError details to a reported error', async () => {
    config.sentryDsn = 'https://deadbeef:deadbeef@127.0.0.1/123';
    await configureSentry(server, config);
    const endError = new EndpointError(
      'An internal server error has occurred',
      {
        reason: 'connect refused',
        attempt: {
          method: 'PUT',
          path: '/account/',
        },
      }
    );
    endError.output = {
      error: '127.0.0.1 error',
      message: 'Underlying error',
      statusCode: 500,
    };
    const sentryCaptureSpy = sandbox.stub(Sentry, 'captureException');
    const scopeContextSpy = sinon.fake();
    const scopeSpy = {
      addEventProcessor: sinon.fake(),
      setContext: scopeContextSpy,
      setExtra: sinon.fake(),
    };
    sandbox.replace(Sentry, 'withScope', fn => fn(scopeSpy));
    const fullError = new verror.WError(endError, 'Something bad happened');
    await server.events.emit({ name: 'request', channel: 'error' }, [
      {},
      { error: fullError },
    ]);

    sentryCaptureSpy.calledOnceWith(fullError);
    assert.equal(scopeContextSpy.calledOnce, true);
    const ctx = scopeContextSpy.args[0][1];
    assert.equal(ctx.method, endError.attempt.method);
    assert.equal(ctx.path, endError.attempt.path);
    assert.equal(ctx.errorName, 'EndpointError');
    assert.equal(ctx.reason, endError.reason);
  });
});
