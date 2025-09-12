/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockAppContext, renderWithRouter } from '../../../models/mocks';
import { MfaGuard } from './index';
import { JwtTokenCache, MfaOtpRequestCache } from '../../../lib/cache';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { AppContext } from '../../../models';

const mockSessionToken = 'session-xyz';
const mockOtp = '123456';
const mockScope = 'test';
const mockAuthClient = {
  mfaRequestOtp: jest.fn().mockResolvedValue(undefined),
  mfaOtpVerify: jest.fn((sessionToken, code, requiredScope) => {
    if (code === mockOtp) {
      return Promise.resolve({ accessToken: 'new-jwt' });
    }
    return Promise.reject(AuthUiErrors.INVALID_EXPIRED_OTP_CODE);
  }),
};
const mockAlertBar = { error: jest.fn() };
const mockNavigate = jest.fn();

jest.mock('../../../lib/cache', () => {
  const actual = jest.requireActual('../../../lib/cache');
  return {
    __esModule: true,
    ...actual,
    sessionToken: () => mockSessionToken,
  };
});

jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useAuthClient: () => mockAuthClient,
  useAlertBar: () => mockAlertBar,
}));

jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

async function submitCode(otp: string = mockOtp) {
  await userEvent.type(
    screen.getByRole('textbox', { name: 'Enter 6-digit code' }),
    otp
  );
  await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
}

describe('MfaGuard', () => {
  beforeEach(() => {
    JwtTokenCache.removeToken(mockSessionToken, mockScope);
    MfaOtpRequestCache.remove(mockSessionToken, mockScope);
    jest.clearAllMocks();
  });

  it('requests OTP and shows modal when JWT missing', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <MfaGuard requiredScope={mockScope}>
          <div>secured</div>
        </MfaGuard>
      </AppContext.Provider>
    );

    expect(mockAuthClient.mfaRequestOtp).toHaveBeenCalledWith(
      mockSessionToken,
      mockScope
    );

    expect(
      await screen.findByText('Enter confirmation code')
    ).toBeInTheDocument();

    await submitCode();

    expect(mockAuthClient.mfaOtpVerify).toHaveBeenCalledWith(
      mockSessionToken,
      mockOtp,
      mockScope
    );
  });

  it('renders children when JWT exists', () => {
    JwtTokenCache.setToken(mockSessionToken, mockScope, 'jwt-present');

    renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <MfaGuard requiredScope={mockScope}>
          <div>secured</div>
        </MfaGuard>
      </AppContext.Provider>
    );

    expect(screen.getByText('secured')).toBeInTheDocument();
    expect(
      screen.queryByText('Enter confirmation code')
    ).not.toBeInTheDocument();
    expect(mockAuthClient.mfaRequestOtp).not.toHaveBeenCalled();
  });

  it('shows error banner on invalid OTP', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <MfaGuard requiredScope={mockScope}>
          <div>secured</div>
        </MfaGuard>
      </AppContext.Provider>
    );

    expect(screen.queryByText('Enter confirmation code')).toBeInTheDocument();
    await submitCode('654321');

    expect(
      await screen.findByText('Invalid or expired confirmation code')
    ).toBeInTheDocument();
  });

  it('clears error banner on input change', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <MfaGuard requiredScope={mockScope} debounceIntervalMs={0}>
          <div>secured</div>
        </MfaGuard>
      </AppContext.Provider>
    );

    expect(screen.getByText('Enter confirmation code')).toBeInTheDocument();
    await submitCode('654321');
    expect(
      await screen.findByText('Invalid or expired confirmation code')
    ).toBeInTheDocument();

    await userEvent.clear(screen.getByRole('textbox'));

    expect(
      screen.queryByText('Invalid or expired confirmation code')
    ).not.toBeInTheDocument();
  });

  it('shows resend success banner and hides error banner on resend success', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <MfaGuard requiredScope={mockScope} debounceIntervalMs={0}>
          <div>secured</div>
        </MfaGuard>
      </AppContext.Provider>
    );

    // Trigger an error first
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Enter 6-digit code' }),
      '654321'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(
      await screen.findByText('Invalid or expired confirmation code')
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Email new code.' })
    );
    expect(
      await screen.findByText('A new code was sent to your email.')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Invalid or expired confirmation code')
    ).not.toBeInTheDocument();
  });

  it('shows error banner and hide success banner on resend error', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <MfaGuard requiredScope={mockScope} debounceIntervalMs={0}>
          <div>secured</div>
        </MfaGuard>
      </AppContext.Provider>
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Email new code.' })
    );
    expect(
      await screen.findByText('A new code was sent to your email.')
    ).toBeInTheDocument();

    mockAuthClient.mfaRequestOtp.mockRejectedValueOnce(
      AuthUiErrors.UNEXPECTED_ERROR
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Email new code.' })
    );
    expect(await screen.findByText('Unexpected error')).toBeInTheDocument();
  });

  it('goes home and shows error alert bar if request for OTP fails', async () => {
    mockAuthClient.mfaRequestOtp.mockRejectedValueOnce(
      AuthUiErrors.UNEXPECTED_ERROR
    );

    renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <MfaGuard requiredScope={mockScope} debounceIntervalMs={0}>
          <div>secured</div>
        </MfaGuard>
      </AppContext.Provider>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/settings');
      expect(mockAlertBar.error).toHaveBeenCalledWith('Unexpected error');
    });
  });

  it('debounces OPT resend requests', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <MfaGuard requiredScope={mockScope} debounceIntervalMs={100}>
          <div>secured</div>
        </MfaGuard>
      </AppContext.Provider>
    );
    // Should be debounced! The dialog just rendered and a code went out...
    await userEvent.click(
      screen.getByRole('button', { name: 'Email new code.' })
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 101));
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'Email new code.' })
    );
    // Should be debounced! The resend request above was just clicked...
    await userEvent.click(
      screen.getByRole('button', { name: 'Email new code.' })
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 101));
    });
    await userEvent.click(
      screen.getByRole('button', { name: 'Email new code.' })
    );

    expect(mockAuthClient.mfaRequestOtp).toHaveBeenCalledTimes(3);
  });
});
