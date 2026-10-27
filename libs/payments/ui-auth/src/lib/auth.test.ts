/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mockNextAuth = jest.fn();
const mockLoggerError = jest.fn();

jest.mock('next-auth', () => ({
  __esModule: true,
  default: (config: unknown) => mockNextAuth(config),
  customFetch: Symbol('customFetch'),
}));

jest.mock('@fxa/payments/ui/server', () => ({
  getApp: () => ({
    getLogger: () => ({ error: mockLoggerError }),
  }),
}));

import { setupAuth } from './auth';
import { AuthError } from './auth.error';

describe('setupAuth logger', () => {
  let loggerError: (error: Error) => void;

  beforeEach(() => {
    mockNextAuth.mockReset().mockReturnValue({});
    mockLoggerError.mockReset();
    delete (global as any).__singletons;

    setupAuth({
      issuerUrl: 'https://accounts.example.com',
      wellKnownUrl: 'https://accounts.example.com/.well-known',
      tokenUrl: 'https://accounts.example.com/token',
      userinfoUrl: 'https://accounts.example.com/userinfo',
      clientId: 'client-id',
      clientSecret: 'client-secret',
      contentServerUrl: 'https://accounts.example.com',
      paymentsNextHostedUrl: 'https://payments.example.com',
    });
    loggerError = mockNextAuth.mock.calls[0][0].logger.error;
  });

  const PROVIDER_NOT_FOUND_MESSAGE =
    'Provider with id "%3f%0apizza:pizza=pizza" not found. Available providers: [fxa].';

  it('does not throw for messages containing printf specifiers', () => {
    expect(() =>
      loggerError(new Error(PROVIDER_NOT_FOUND_MESSAGE))
    ).not.toThrow();
  });

  it('logs the original message verbatim', () => {
    loggerError(new Error(PROVIDER_NOT_FOUND_MESSAGE));

    expect(mockLoggerError).toHaveBeenCalledWith(PROVIDER_NOT_FOUND_MESSAGE, {
      error: expect.any(AuthError),
    });
  });

  it('wraps the original error as the AuthError cause', () => {
    const cause = new Error(PROVIDER_NOT_FOUND_MESSAGE);
    loggerError(cause);

    const { error } = mockLoggerError.mock.calls[0][1];
    expect(error.message).toBe(`Auth.js error: ${PROVIDER_NOT_FOUND_MESSAGE}`);
    expect(error.cause()).toBe(cause);
  });
});
