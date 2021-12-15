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
const error = require('../../lib/error');

const config = require('../../config').getProperties();
const {
  configureSentry,
  formatMetadataValidationErrorMessage,
} = require('../../lib/sentry');

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
    config.sentryDsn = 'https://deadbeef:deadbeef@localhost/123';
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

  it('adds payload details to an internal validation error', async () => {
    config.sentryDsn = 'https://deadbeef:deadbeef@localhost/123';
    await configureSentry(server, config);
    const err = error.internalValidationError(
      'internalError',
      { extra: 'data' },
      'Missing data'
    );
    const sentryCaptureSpy = sandbox.stub(Sentry, 'captureException');
    const scopeContextSpy = sinon.fake();
    const scopeSpy = {
      addEventProcessor: sinon.fake(),
      setContext: scopeContextSpy,
      setExtra: sinon.fake(),
    };
    sandbox.replace(Sentry, 'withScope', (fn) => fn(scopeSpy));
    await server.events.emit({ name: 'request', channel: 'error' }, [
      {},
      { error: err },
    ]);

    sinon.assert.calledTwice(scopeSpy.setContext);
    sinon.assert.calledWith(scopeSpy.setContext, 'payload', {
      code: 500,
      errno: 998,
      error: 'Internal Server Error',
      info: 'https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/api.md#response-format',
      message: 'An internal validation check failed.',
      op: 'internalError',
    });
    sinon.assert.calledWith(scopeSpy.setContext, 'payload.data', {
      extra: 'data',
    });
    sinon.assert.calledOnceWithExactly(sentryCaptureSpy, err);
  });

  it('adds EndpointError details to a reported error', async () => {
    config.sentryDsn = 'https://deadbeef:deadbeef@localhost/123';
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
      error: 'localhost error',
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
    sandbox.replace(Sentry, 'withScope', (fn) => fn(scopeSpy));
    const fullError = new verror.WError(endError, 'Something bad happened');
    await server.events.emit({ name: 'request', channel: 'error' }, [
      {},
      { error: fullError },
    ]);

    sinon.assert.calledOnceWithExactly(scopeSpy.setContext, 'cause', {
      errorMessage: 'An internal server error has occurred',
      errorName: 'EndpointError',
      method: 'PUT',
      path: '/account/',
      reason: 'connect refused',
    });
    sinon.assert.calledOnceWithExactly(sentryCaptureSpy, fullError);
    const ctx = scopeContextSpy.args[0][1];
    assert.equal(ctx.method, endError.attempt.method);
    assert.equal(ctx.path, endError.attempt.path);
    assert.equal(ctx.errorName, 'EndpointError');
    assert.equal(ctx.reason, endError.reason);
  });

  describe('ignores errors', () => {
    let sentryCaptureSpy;

    beforeEach(async () => {
      config.sentryDsn = 'https://deadbeef:deadbeef@localhost/123';
      sentryCaptureSpy = sandbox.stub(Sentry, 'captureException');
      const scopeSpy = {
        addEventProcessor: sinon.fake(),
        setContext: sinon.fake(),
        setExtra: sinon.fake(),
      };
      sandbox.replace(Sentry, 'withScope', (fn) => fn(scopeSpy));

      await configureSentry(server, config);
    });

    afterEach(() => {
      sandbox.reset();
    });

    it('ignores WError by error number', async () => {
      await server.events.emit({ name: 'request', channel: 'error' }, [
        {},
        {
          error: new verror.WError(
            error.emailBouncedHard(),
            'Something bad happened'
          ),
        },
      ]);
      sinon.assert.notCalled(sentryCaptureSpy);
    });

    it('ignores error by error number', async () => {
      await server.events.emit({ name: 'request', channel: 'error' }, [
        {},
        { error: error.emailBouncedHard() },
      ]);
      sinon.assert.notCalled(sentryCaptureSpy);
    });

    it('does not ignore valid error', async () => {
      await server.events.emit({ name: 'request', channel: 'error' }, [
        {},
        {
          error: new verror.WError(
            error.unknownRefreshToken(),
            'Something bad happened'
          ),
        },
      ]);
      sinon.assert.calledOnce(sentryCaptureSpy);
    });

    it('does not ingore valid error', async () => {
      await server.events.emit({ name: 'request', channel: 'error' }, [
        {},
        { error: error.unknownRefreshToken() },
      ]);
      sinon.assert.calledOnce(sentryCaptureSpy);
    });
  });

  describe('Sentry helpers', () => {
    describe('formatMetadataValidationErrorMessage', () => {
      let error, actualMsg, expectedMsg;
      const plan = {
        id: 'plan_123',
      };
      it('formats the error message when error is a string', () => {
        error = 'Capability missing from metadata';
        actualMsg = formatMetadataValidationErrorMessage(plan.id, error);
        expectedMsg = `${plan.id} metadata invalid: ${error}`;
        assert.deepEqual(actualMsg, expectedMsg);
      });
      it('formats the error message when error is an object', () => {
        error = {
          details: [
            {
              message: '"downloadURL" is required',
              type: 'any.required',
            },
            {
              message: 'product:privacyNoticeURL must be a valid uri',
              type: 'string.uri',
            },
          ],
        };
        expectedMsg = `${plan.id} metadata invalid: ${error.details[0].message}; ${error.details[1].message};`;
        actualMsg = formatMetadataValidationErrorMessage(plan.id, error);
        assert.deepEqual(actualMsg, expectedMsg);
      });
    });
  });
});
