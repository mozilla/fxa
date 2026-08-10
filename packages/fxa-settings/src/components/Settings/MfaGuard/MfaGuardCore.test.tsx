/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockAppContext, renderWithRouter } from '../../../models/mocks';
import { MfaGuardCore } from './MfaGuardCore';
import { JwtTokenCache, MfaOtpRequestCache } from '../../../lib/cache';
import { AppContext } from '../../../models';
import { MfaReason } from '../../../lib/types';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

const mockSessionToken = 'session-core';
const mockScope = 'test';
const mockAuthClient = {
  mfaRequestOtp: jest.fn().mockResolvedValue(undefined),
  mfaOtpVerify: jest.fn(),
};

jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useAuthClient: () => mockAuthClient,
}));

jest.mock('@sentry/react', () => ({ captureException: jest.fn() }));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    accountPref: { mfaGuardView: jest.fn(), mfaGuardSubmitSuccess: jest.fn() },
  },
}));

const onDismiss = jest.fn();
const onSessionInvalid = jest.fn();
const onFatalError = jest.fn();

function renderCore() {
  renderWithRouter(
    <AppContext.Provider value={mockAppContext()}>
      <MfaGuardCore
        requiredScope={mockScope}
        reason={MfaReason.test}
        email="user@example.com"
        sessionToken={mockSessionToken}
        onDismiss={onDismiss}
        onSessionInvalid={onSessionInvalid}
        onFatalError={onFatalError}
      >
        <div>secured content</div>
      </MfaGuardCore>
    </AppContext.Provider>
  );
}

const guardHeading = () =>
  screen.findByRole('heading', { name: 'Enter confirmation code' });

describe('MfaGuardCore', () => {
  beforeEach(() => {
    JwtTokenCache.removeToken(mockSessionToken, mockScope);
    // Clear the debounce marker so each test's mount issues a fresh OTP request.
    MfaOtpRequestCache.remove(mockSessionToken, mockScope);
    jest.clearAllMocks();
    mockAuthClient.mfaRequestOtp.mockReset().mockResolvedValue(undefined);
    mockAuthClient.mfaOtpVerify.mockReset();
  });

  it('blocks children and requests an OTP when no JWT is cached', async () => {
    renderCore();

    expect(screen.queryByText('secured content')).not.toBeInTheDocument();
    expect(await guardHeading()).toBeInTheDocument();
    expect(mockAuthClient.mfaRequestOtp).toHaveBeenCalledWith(
      mockSessionToken,
      mockScope
    );
  });

  it('renders children (no OTP request) when a JWT is already cached', () => {
    JwtTokenCache.setToken(mockSessionToken, mockScope, 'jwt-present');

    renderCore();

    expect(screen.getByText('secured content')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Enter confirmation code' })
    ).not.toBeInTheDocument();
    expect(mockAuthClient.mfaRequestOtp).not.toHaveBeenCalled();
  });

  it('calls onSessionInvalid when the OTP request rejects with an invalid token', async () => {
    mockAuthClient.mfaRequestOtp.mockRejectedValueOnce({
      errno: AuthUiErrors.INVALID_TOKEN.errno,
    });

    renderCore();

    await waitFor(() => expect(onSessionInvalid).toHaveBeenCalled());
    expect(onFatalError).not.toHaveBeenCalled();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('keeps the modal open (not fatal) when the OTP request is rate limited', async () => {
    mockAuthClient.mfaRequestOtp.mockRejectedValueOnce({ code: 429 });

    renderCore();

    // A 429 is recoverable: the modal stays up for the user to retry rather
    // than bouncing them out.
    expect(await guardHeading()).toBeInTheDocument();
    expect(onFatalError).not.toHaveBeenCalled();
    expect(onSessionInvalid).not.toHaveBeenCalled();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('reports a fatal error and dismisses on an unexpected OTP request failure', async () => {
    mockAuthClient.mfaRequestOtp.mockRejectedValueOnce(new Error('boom'));

    renderCore();

    await waitFor(() =>
      expect(onFatalError).toHaveBeenCalledWith(expect.any(String))
    );
    expect(onDismiss).toHaveBeenCalled();
    expect(onSessionInvalid).not.toHaveBeenCalled();
  });

  it('caches the JWT and renders children after a successful OTP verification', async () => {
    const user = userEvent.setup();
    mockAuthClient.mfaOtpVerify.mockResolvedValue({
      accessToken: 'verified-jwt',
    });

    renderCore();
    await guardHeading();

    await user.type(screen.getByRole('textbox'), '123456');
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(await screen.findByText('secured content')).toBeInTheDocument();
    expect(JwtTokenCache.hasToken(mockSessionToken, mockScope)).toBe(true);
    expect(mockAuthClient.mfaOtpVerify).toHaveBeenCalledWith(
      mockSessionToken,
      '123456',
      mockScope
    );
  });

  it('keeps blocking children when OTP verification fails', async () => {
    const user = userEvent.setup();
    mockAuthClient.mfaOtpVerify.mockRejectedValue(new Error('bad code'));

    renderCore();
    await guardHeading();

    await user.type(screen.getByRole('textbox'), '123456');
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => expect(mockAuthClient.mfaOtpVerify).toHaveBeenCalled());
    expect(screen.queryByText('secured content')).not.toBeInTheDocument();
    expect(JwtTokenCache.hasToken(mockSessionToken, mockScope)).toBe(false);
  });
});
