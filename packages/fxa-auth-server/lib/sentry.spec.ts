/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


import * as Hapi from '@hapi/hapi';
import * as verror from 'verror';

// Mock @sentry/node — its exports are frozen/non-configurable so jest.spyOn
// cannot redefine them. Use jest.mock to create a writable mock layer.
const mockCaptureException = jest.fn();
const mockWithScope = jest.fn();
const mockGetGlobalScope = jest.fn().mockReturnValue({ setTag: jest.fn() });
const mockSetTag = jest.fn();
const mockSetUser = jest.fn();
const mockSetExtra = jest.fn();
const mockHapiIntegration = jest.fn();
const mockLinkedErrorsIntegration = jest.fn();
const mockCaptureMessage = jest.fn();

jest.mock('@sentry/node', () => ({
  captureException: mockCaptureException,
  captureMessage: mockCaptureMessage,
  withScope: mockWithScope,
  getGlobalScope: mockGetGlobalScope,
  setTag: mockSetTag,
  setUser: mockSetUser,
  setExtra: mockSetExtra,
  hapiIntegration: mockHapiIntegration,
  linkedErrorsIntegration: mockLinkedErrorsIntegration,
}));

const { AppError: error } = require('@fxa/accounts/errors');
const config = require('../config').default.getProperties();
const {
  configureSentry,
  formatMetadataValidationErrorMessage,
  filterExtras,
} = require('./sentry');

describe('Sentry', () => {
  let server: Hapi.Server;
  let scopeContextSpy: jest.Mock;
  let scopeSpy: {
    addEventProcessor: jest.Mock;
    setContext: jest.Mock;
    setExtra: jest.Mock;
  };

  beforeEach(() => {
    // Reset all Sentry mocks
    mockCaptureException.mockClear();
    mockWithScope.mockClear();

    scopeContextSpy = jest.fn();
    scopeSpy = {
      addEventProcessor: jest.fn(),
      setContext: scopeContextSpy,
      setExtra: jest.fn(),
    };
    config.sentry.dsn = 'https://deadbeef:deadbeef@localhost/123';
    mockWithScope.mockImplementation((fn: any) => fn(scopeSpy));

    // Mock server
    server = new Hapi.Server({});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  async function emitError(err: Error) {
    await server.events.emit(
      {
        name: 'request',
        channel: 'error',
        tags: { handler: true, error: true },
      },
      [{}, { error: err }]
    );
  }

  const _testError = (code: number, errno: number, innerError?: Error) => {
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
    expect(filterExtras({ authPW: 'secret123' })).toEqual({
      authPW: '[Filtered]',
    });
    expect(filterExtras({ authorization: 'secret123' })).toEqual({
      authorization: '[Filtered]',
    });
    expect(filterExtras({ l1: { authPW: 'secret123' } })).toEqual({
      l1: { authPW: '[Filtered]' },
    });
    expect(
      filterExtras({
        l1: { l2: { l3: { l4: { l5: { l6: { authPW: 'secret123' } } } } } },
      })
    ).toEqual({ l1: { l2: { l3: { l4: { l5: '[Filtered]' } } } } });
  });

  it('can be set up when sentry is enabled', async () => {
    let throws = false;
    try {
      await configureSentry(server, config);
    } catch (err) {
      throws = true;
    }
    expect(throws).toBe(false);
  });

  it('can be set up when sentry is not enabled', async () => {
    config.sentry.dsn = '';
    let throws = false;
    try {
      await configureSentry(server, config);
    } catch (err) {
      throws = true;
    }
    expect(throws).toBe(false);
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

    expect(mockCaptureException).toHaveBeenCalledTimes(1);
    expect(mockCaptureException).toHaveBeenCalledWith(err);
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
      expect(mockCaptureException).toHaveBeenCalledTimes(1);
    });

    it('reports valid WError with inner error', async () => {
      await emitError(
        new verror.WError(
          _testError(errorCode, errno, new Error('BOOM')),
          'Something bad happened'
        )
      );
      expect(mockCaptureException).toHaveBeenCalledTimes(1);
    });

    it('reports valid error with error', async () => {
      await emitError(_testError(errorCode, errno, new Error('BOOM')));
      await new Promise((resolve) => setTimeout(resolve, 1));
      expect(mockCaptureException).toHaveBeenCalledTimes(1);
    });

    it('reports valid error with inner error', async () => {
      await emitError(_testError(errorCode, errno, new Error('BOOM')));
      await new Promise((resolve) => setTimeout(resolve, 1));
      expect(mockCaptureException).toHaveBeenCalledTimes(1);
    });
  });

  describe('Sentry helpers', () => {
    describe('formatMetadataValidationErrorMessage', () => {
      const plan = {
        id: 'plan_123',
      };

      it('formats the error message when error is a string', () => {
        const errorStr = 'Capability missing from metadata';
        const actualMsg = formatMetadataValidationErrorMessage(
          plan.id,
          errorStr
        );
        const expectedMsg = `${plan.id} metadata invalid: ${errorStr}`;
        expect(actualMsg).toEqual(expectedMsg);
      });

      it('formats the error message when error is an object', () => {
        const errorObj = {
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
        const expectedMsg = `${plan.id} metadata invalid: ${errorObj.details[0].message}; ${errorObj.details[1].message};`;
        const actualMsg = formatMetadataValidationErrorMessage(
          plan.id,
          errorObj
        );
        expect(actualMsg).toEqual(expectedMsg);
      });
    });
  });
});
