/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockAppContext, renderWithRouter } from '../../../models/mocks';
import { MfaGuard } from './index';
import { JwtTokenCache, MfaOtpRequestCache } from '../../../lib/cache';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { AppContext } from '../../../models';
import { MfaReason } from '../../../lib/types';
import GleanMetrics from '../../../lib/glean';

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
        <MfaGuard requiredScope={mockScope} reason={MfaReason.test}>
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

  it('emits metrics on success', async () => {
    const submitSuccessSpy = jest.spyOn(
      GleanMetrics.accountPref,
      'mfaGuardSubmitSuccess'
    );
    renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <MfaGuard requiredScope={mockScope} reason={MfaReason.test}>
          <div>secured</div>
        </MfaGuard>
      </AppContext.Provider>
    );
    await submitCode();
    await waitFor(() => {
      expect(submitSuccessSpy).toHaveBeenCalledWith({
        event: { reason: MfaReason.test },
      });
    });
  });

  it('renders children when JWT exists', () => {
    JwtTokenCache.setToken(mockSessionToken, mockScope, 'jwt-present');

    renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <MfaGuard requiredScope={mockScope} reason={MfaReason.test}>
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

  it('renders dialog when JWT has expired', async () => {
    // Set an expired token...
    JwtTokenCache.setToken(
      mockSessionToken,
      mockScope,
      // The middle part of the string is the payload. The other parts don't matter for this test.
      '__.eyJzdWIiOiI4YjMzNmZlNGE5MmM0ZTk5YmMyNGIyMjFmOTUzMzk0MiIsInNjb3BlIjpbIm1mYTpyZWNvdmVyeV9rZXkiXSwiaWF0IjoxNzU5MjQ3MTE3LCJqdGkiOiJjYmY1N2M2MC1hYzcwLTRhNGEtYTdkMy0wN2U0NTdlM2E4MWYiLCJzdGlkIjoiMzI5ZjQzNTFiMDUwN2QwNDVmNDYxZWQxNWY4MzZmNDM3MDBhMmM0YTk5NmVlMWM1ODMxZTQzNGIxZjc4ZjFhNCIsImV4cCI6MTc1OTI0NzE0NywiYXVkIjoiZnhhIiwiaXNzIjoiYWNjb3VudHMuZmlyZWZveC5jb20ifQ.__'
    );

    renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <MfaGuard requiredScope={mockScope} reason={MfaReason.test}>
          <div>secured</div>
        </MfaGuard>
      </AppContext.Provider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Enter confirmation code')).toBeInTheDocument();
      expect(mockAuthClient.mfaRequestOtp).toHaveBeenCalled();
    });
  });

  it('shows error banner on invalid OTP', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <MfaGuard requiredScope={mockScope} reason={MfaReason.test}>
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
        <MfaGuard
          requiredScope={mockScope}
          debounceIntervalMs={0}
          reason={MfaReason.test}
        >
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
        <MfaGuard
          requiredScope={mockScope}
          debounceIntervalMs={0}
          reason={MfaReason.test}
        >
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
        <MfaGuard
          requiredScope={mockScope}
          debounceIntervalMs={0}
          reason={MfaReason.test}
        >
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
        <MfaGuard
          requiredScope={mockScope}
          debounceIntervalMs={0}
          reason={MfaReason.test}
        >
          <div>secured</div>
        </MfaGuard>
      </AppContext.Provider>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/settings');
      expect(mockAlertBar.error).toHaveBeenCalledWith('Unexpected error');
    });
  });

  it('invokes onDismiss when dialog is dismissed', async () => {
    const mockOnDismiss = jest.fn().mockResolvedValue(undefined);

    renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <MfaGuard
          requiredScope={mockScope}
          onDismissCallback={mockOnDismiss}
          debounceIntervalMs={0}
          reason={MfaReason.test}
        >
          <div>secured</div>
        </MfaGuard>
      </AppContext.Provider>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('debounces OTP resend requests', async () => {
    // Use a deterministic clock so debounce logic is not affected by system load.
    let now = Date.now();
    const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => now);

    renderWithRouter(
      <AppContext.Provider value={mockAppContext()}>
        <MfaGuard
          requiredScope={mockScope}
          debounceIntervalMs={100}
          reason={MfaReason.test}
        >
          <div>secured</div>
        </MfaGuard>
      </AppContext.Provider>
    );

    // Should be debounced! The dialog just rendered and a code went out...
    await userEvent.click(
      screen.getByRole('button', { name: 'Email new code.' })
    );

    now += 101;

    await userEvent.click(
      screen.getByRole('button', { name: 'Email new code.' })
    );
    // Should be debounced! The resend request above was just clicked...
    await userEvent.click(
      screen.getByRole('button', { name: 'Email new code.' })
    );

    // Advance past the debounce window again
    now += 101;

    await userEvent.click(
      screen.getByRole('button', { name: 'Email new code.' })
    );

    expect(mockAuthClient.mfaRequestOtp).toHaveBeenCalledTimes(3);

    dateNowSpy.mockRestore();
  });
});
