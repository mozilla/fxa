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
const AppError = require('../../lib/error');

const config = require('../../config').default.getProperties();
const {
  configureSentry,
  formatMetadataValidationErrorMessage,
  getRootCause,
  ignoreErrors,
} = require('../../lib/sentry');

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
    return new AppError(
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
    const err = AppError.internalValidationError(
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

  describe('determines root cause of error', () => {
    it('returns generic error', () => {
      const error1 = new Error('BOOM');
      const cause = getRootCause(error1);
      assert.strictEqual(error1, cause);
    });

    it('returns nested generic error', () => {
      const error1 = new Error('BOOM');
      const error2 = _testError(500, 0, error1);
      const cause = getRootCause(error2);
      assert.strictEqual(error1, cause);
    });

    it('returns deeply nested generic error', () => {
      const error1 = new Error('BOOM');
      const error2 = _testError(500, 0, error1);
      const error3 = _testError(500, 0, error2);
      const cause = getRootCause(error3);
      assert.strictEqual(error1, cause);
    });

    it('returns generic error', () => {
      const error1 = new Error('BOOM');
      const cause = getRootCause(error1);
      assert.strictEqual(error1, cause);
    });

    it('returns app error', () => {
      const error1 = _testError(500, 0);
      const cause = getRootCause(error1);
      assert.strictEqual(error1, cause);
    });

    it('return nested AppError', () => {
      const error1 = _testError(500, 0);
      const error2 = _testError(500, 0, error1);
      const cause = getRootCause(error2);
      assert.strictEqual(error1, cause);
    });

    it('return deeply nested AppError', () => {
      const error1 = _testError(500, 0);
      const error2 = _testError(500, 0, error1);
      const error3 = _testError(500, 0, error2);
      const cause = getRootCause(error3);
      assert.strictEqual(error1, cause);
    });

    it('determines cause of nested Error', async () => {
      const error1 = new Error('BOOM');
      const error2 = _testError(
        500,
        AppError.ERRNO.INTERNAL_VALIDATION_ERROR,
        error1
      );
      const cause = getRootCause(error2);
      assert.strictEqual(error1, cause);
    });

    it('determines cause of deeply nested AppError', async () => {
      const error1 = new Error('BOOM');
      const error2 = _testError(
        500,
        AppError.ERRNO.INTERNAL_VALIDATION_ERROR,
        error1
      );
      const error3 = _testError(
        500,
        AppError.ERRNO.INTERNAL_VALIDATION_ERROR,
        error2
      );
      const cause = getRootCause(error3);
      assert.strictEqual(error1, cause);
    });

    it('determines cause of nested WError', async () => {
      const error1 = new Error('BOOM');
      const error2 = new verror.WError(error1);
      const error3 = new verror.WError(error2);
      const cause = getRootCause(error3);
      assert.strictEqual(error1, cause);
    });
  });

  describe('ignores errors', () => {
    beforeEach(async () => {
      await configureSentry(server, config);
    });

    describe('ignores by error code', () => {
      // ACCOUNT_CREATION_REJECTED should not be ignored
      const errno = AppError.ERRNO.ACCOUNT_CREATION_REJECTED;

      // But, anything below 500 should be ignored
      const errorCode = 400;

      it('ignores AppError', async () => {
        const error1 = _testError(errorCode, errno);
        assert.isTrue(ignoreErrors(error1));
      });

      it('ignores nested AppError', async () => {
        const error1 = _testError(errorCode, errno);
        const error2 = _testError(errorCode, errno, error1);
        assert.isTrue(ignoreErrors(error2));
      });

      it('ignores WError with nested AppError', async () => {
        const error1 = _testError(errorCode, errno);
        const error2 = new verror.WError(error1);
        assert.isTrue(ignoreErrors(error2));
      });

      it('ignores WError with deeply nested AppError', async () => {
        const error1 = _testError(errorCode, errno);
        const error2 = _testError(errorCode, errno, error1);
        const error3 = new verror.WError(error2);
        assert.isTrue(ignoreErrors(error3));
      });
    });

    describe('by error number', () => {
      // A 500 error could would not be ignored
      const errorCode = 500;
      // BOUNCE_HARD should be ignored
      const errno = AppError.ERRNO.BOUNCE_HARD;

      it('ignores app error', async () => {
        const error1 = _testError(errorCode, errno);
        assert.isTrue(ignoreErrors(error1));
      });

      it('ignores nested app error', async () => {
        const error1 = _testError(errorCode, errno);
        const error2 = _testError(errorCode, errno, error1);
        assert.isTrue(ignoreErrors(error2));
      });

      it('ignores deeply nested app error', async () => {
        const error1 = _testError(errorCode, errno);
        const error2 = _testError(errorCode, errno, error1);
        const error3 = _testError(errorCode, errno, error2);
        assert.isTrue(ignoreErrors(error3));
      });
    });

    describe('by event state', () => {
      // ACCOUNT_CREATION_REJECTED should not be ignored
      const errno = AppError.ERRNO.ACCOUNT_CREATION_REJECTED;

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
    const errno = AppError.ERRNO.ACCOUNT_CREATION_REJECTED;

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

    it('reports a generic error with 400 statusCode', async () => {
      // Typically status codes less than 500 are not reported to sentry; however,
      // if the call result of an unhandled error in an API call, we would want to
      // report it to sentry.

      const error = new Error('BOOM');
      error.statusCode = 400; // Status code less than 500 typically ignored.
      error.errno = 134; // Commonly ignored AppError

      await emitError(error);
      await new Promise((resolve) => setTimeout(resolve, 1));
      sandbox.assert.calledOnceWithExactly(sentryCaptureSpy, error);
    });

    it('reports an inner error with 400 status code', async () => {
      // Typically status codes less than 500 are not reported to sentry; however,
      // if the call result of an unhandled error in an API call, we would want to
      // report it to sentry.

      const error = new Error('BOOM');
      error.statusCode = 400;

      const wrappedError = new verror.WError(
        _testError(400, errno, error),
        'Something bad happened'
      );

      await emitError(wrappedError);

      await new Promise((resolve) => setTimeout(resolve, 1));
      sandbox.assert.calledOnceWithExactly(sentryCaptureSpy, wrappedError);
    });

    it('reports general error', () => {
      const error1 = new Error('BOOM!');
      emitError(error1);
      sandbox.assert.calledOnceWithExactly(sentryCaptureSpy, error1);
    });

    it('reports AppError nested general inner error', () => {
      // Generally these states would be ignored
      const error1 = new Error('BOOM!');
      const error2 = _testError(400, 0, error1);
      emitError(error2);
      sandbox.assert.calledOnceWithExactly(sentryCaptureSpy, error2);
    });

    it('reports AppError deeply nested general inner error', () => {
      // Generally these states would be ignored
      const error1 = new Error('BOOM!');
      const error2 = _testError(400, 0, error1);
      const error3 = _testError(400, 0, error2);
      emitError(error3);
      sandbox.assert.calledOnceWithExactly(sentryCaptureSpy, error3);
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
