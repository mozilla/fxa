/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const sinon = require('sinon');
const verror = require('verror');
const Hapi = require('@hapi/hapi');
const Sentry = require('@sentry/node');
const { AppError: error } = require('@fxa/accounts/errors');

const config = require('../../config').default.getProperties();
const {
  configureSentry,
  formatMetadataValidationErrorMessage,
  filterExtras,
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

  it('can filter sentry extras', () => {
    assert.deepEqual(filterExtras({ authPW: 'secret123' }), {
      authPW: '[Filtered]',
    });
    assert.deepEqual(filterExtras({ authorization: 'secret123' }), {
      authorization: '[Filtered]',
    });
    assert.deepEqual(filterExtras({ l1: { authPW: 'secret123' } }), {
      l1: { authPW: '[Filtered]' },
    });
    assert.deepEqual(
      filterExtras({
        l1: { l2: { l3: { l4: { l5: { l6: { authPW: 'secret123' } } } } } },
      }),
      { l1: { l2: { l3: { l4: { l5: '[Filtered]' } } } } }
    );
  });

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

  it('captures internal validation error', async () => {
    await configureSentry(server, config);
    const err = error.internalValidationError('internalError', {
      extra: 'data',
    });
    await server.events.emit(
      {
        name: 'request',
        channel: 'error',
        tags: { handler: true, error: true },
      },
      [{}, { error: err }]
    );

    sandbox.assert.calledOnceWithExactly(sentryCaptureSpy, err);
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
