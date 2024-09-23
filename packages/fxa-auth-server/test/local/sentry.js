/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';
import EndpointErrorModule from "poolee/lib/error";
const EndpointError = EndpointErrorModule(require('util').inherits);
import sinon from 'sinon';
import verror from 'verror';
import Hapi from '@hapi/hapi';
import Sentry from '@sentry/node';
import error from '../../lib/error';

import configModule from "../../config";
const config = configModule.getProperties();
import { configureSentry, formatMetadataValidationErrorMessage } from '../../lib/sentry';

const sandbox = sinon.createSandbox();

describe('Sentry', () => {
  let server;
  let sentryCaptureSpy;
  let scopeContextSpy;
  let scopeSpy;

  beforeEach(() => {
    // Sentry fakes and spies
    sentryCaptureSpy = sandbox.stub(Sentry, 'captureException');
    scopeContextSpy = sandbox.fake();
    scopeSpy = {
      addEventProcessor: sandbox.fake(),
      setContext: scopeContextSpy,
      setExtra: sandbox.fake(),
    };
    config.sentry.dsn = 'https://deadbeef:deadbeef@localhost/123';
    sandbox.replace(Sentry, 'withScope', (fn) => fn(scopeSpy));

    // Mock server
    server = new Hapi.Server({});
  });

  afterEach(() => {
    sandbox.restore();
  });

  async function emitError(error) {
    await server.events.emit(
      {
        name: 'request',
        channel: 'error',
        tags: { handler: true, error: true },
      },
      [{}, { error }]
    );
  }

  const _testError = (code, errno, innerError) => {
    const extra = innerError ? [{}, undefined, innerError] : [];
    return new error(
      {
        code,
        error: 'TEST',
        errno,
        message: 'TEST',
      },
      ...extra
    );
  };

  it('can be set up when sentry is enabled', async () => {
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
    await configureSentry(server, config);
    const err = error.internalValidationError(
      'internalError',
      { extra: 'data' },
      'Missing data'
    );
    await server.events.emit(
      {
        name: 'request',
        channel: 'error',
        tags: { handler: true, error: true },
      },
      [{}, { error: err }]
    );

    sandbox.assert.calledTwice(scopeSpy.setContext);
    sandbox.assert.calledWith(scopeSpy.setContext, 'payload', {
      code: 500,
      errno: 998,
      error: 'Internal Server Error',
      info: 'https://mozilla.github.io/ecosystem-platform/api#section/Response-format',
      message: 'An internal validation check failed.',
      op: 'internalError',
    });
    sandbox.assert.calledWith(scopeSpy.setContext, 'payload.data', {
      extra: 'data',
    });
    sandbox.assert.calledOnceWithExactly(sentryCaptureSpy, err);
  });

  it('adds EndpointError details to a reported error', async () => {
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
    const fullError = new verror.WError(endError, 'Something bad happened');
    await server.events.emit(
      {
        name: 'request',
        channel: 'error',
        tags: { handler: true, error: true },
      },
      [{}, { error: fullError }]
    );

    sandbox.assert.calledOnceWithExactly(scopeSpy.setContext, 'cause', {
      errorMessage: 'An internal server error has occurred',
      errorName: 'EndpointError',
      method: 'PUT',
      path: '/account/',
      reason: 'connect refused',
    });
    sandbox.assert.calledOnceWithExactly(sentryCaptureSpy, fullError);
    const ctx = scopeContextSpy.args[0][1];
    assert.equal(ctx.method, endError.attempt.method);
    assert.equal(ctx.path, endError.attempt.path);
    assert.equal(ctx.errorName, 'EndpointError');
    assert.equal(ctx.reason, endError.reason);
  });

  describe('ignores errors', () => {
    beforeEach(async () => {
      await configureSentry(server, config);
    });

    describe('by error code', () => {
      // ACCOUNT_CREATION_REJECTED should not be ignored
      const errno = error.ERRNO.ACCOUNT_CREATION_REJECTED;

      // But, anything below 500 should be ignored
      const errorCode = 400;

      it('ignores standard error', async () => {
        await emitError(_testError(errorCode, errno));
        sandbox.assert.notCalled(sentryCaptureSpy);
      });

      it('ignores standard error with inner error', async () => {
        await emitError(_testError(errorCode, errno, new Error('BOOM')));
        sandbox.assert.notCalled(sentryCaptureSpy);
      });

      it('ignores WError', async () => {
        await emitError(new verror.WError(_testError(errorCode, errno)));
        sandbox.assert.notCalled(sentryCaptureSpy);
      });

      it('ignores WError inner error', async () => {
        await emitError(
          new verror.WError(_testError(errorCode, errno, new Error('BOOM')))
        );
        sandbox.assert.notCalled(sentryCaptureSpy);
      });
    });

    describe('by error number', () => {
      // Anything 500 above should not be ignored.
      const errorCode = 500;

      // But, BOUNCE_HARD should be ignored
      const errno = error.ERRNO.BOUNCE_HARD;

      it('ignores standard error', async () => {
        await emitError(_testError(errorCode, errno));
        sandbox.assert.notCalled(sentryCaptureSpy);
      });

      it('ignores standard error with inner error', async () => {
        await emitError(_testError(errorCode, errno, new Error('BOOM')));
        sandbox.assert.notCalled(sentryCaptureSpy);
      });

      it('ignores WError', async () => {
        await emitError(new verror.WError(_testError(errorCode, errno)));
        sandbox.assert.notCalled(sentryCaptureSpy);
      });

      it('ignores WError inner error', async () => {
        await emitError(
          new verror.WError(_testError(errorCode, errno, new Error('BOOM')))
        );
        sandbox.assert.notCalled(sentryCaptureSpy);
      });
    });

    describe('by event state', () => {
      // ACCOUNT_CREATION_REJECTED should not be ignored
      const errno = error.ERRNO.ACCOUNT_CREATION_REJECTED;

      // And, anything above 500 should be reported
      const errorCode = 500;

      it('ignores event without error tag', async () => {
        await server.events.emit(
          {
            name: 'request',
            channel: 'error',
            tags: { handler: true, error: false },
          },
          [{}, { error: _testError(errorCode, errno) }]
        );
        sandbox.assert.notCalled(sentryCaptureSpy);
      });

      it('ignores event without handler tag', async () => {
        await server.events.emit(
          {
            name: 'request',
            channel: 'error',
            tags: { handler: false, error: true },
          },
          [{}, { error: _testError(errorCode, errno) }]
        );
        sandbox.assert.notCalled(sentryCaptureSpy);
      });

      it('ignores event without tags', async () => {
        await server.events.emit(
          { name: 'request', channel: 'error', tags: undefined },
          [{}, { error: _testError(errorCode, errno) }]
        );
        sandbox.assert.notCalled(sentryCaptureSpy);
      });
    });
  });

  describe('reports errors', () => {
    // ACCOUNT_CREATION_REJECTED should not be ignored
    const errno = error.ERRNO.ACCOUNT_CREATION_REJECTED;

    // And, anything above 500 should be reported
    const errorCode = 500;

    beforeEach(async () => {
      await configureSentry(server, config);
    });

    it('reports valid WError', async () => {
      await emitError(
        new verror.WError(
          _testError(errorCode, errno),
          'Something bad happened'
        )
      );
      sandbox.assert.calledOnce(sentryCaptureSpy);
    });

    it('reports valid WError with inner error', async () => {
      await emitError(
        new verror.WError(
          _testError(errorCode, errno, new Error('BOOM')),
          'Something bad happened'
        )
      );
      sandbox.assert.calledOnce(sentryCaptureSpy);
    });

    it('reports valid error with error', async () => {
      await emitError(_testError(errorCode, errno, new Error('BOOM')));
      await new Promise((resolve) => setTimeout(resolve, 1));
      sandbox.assert.calledOnce(sentryCaptureSpy);
    });

    it('reports valid error with inner error', async () => {
      await emitError(_testError(errorCode, errno, new Error('BOOM')));
      await new Promise((resolve) => setTimeout(resolve, 1));
      sandbox.assert.calledOnce(sentryCaptureSpy);
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
              message: '"successActionButtonURL" is required',
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
