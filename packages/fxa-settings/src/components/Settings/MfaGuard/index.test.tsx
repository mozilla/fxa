/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../models/mocks';
import { MfaGuard } from './index';
import { JwtTokenCache } from '../../../lib/cache';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

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
const mockFtlMsgResolver = {
  getMsg: (id: string, fallback: string) => fallback,
};

jest.mock('../../../lib/cache', () => {
  const actual = jest.requireActual('../../../lib/cache');
  return {
    __esModule: true,
    ...actual,
    sessionToken: () => mockSessionToken,
  };
});

jest.mock('../../../models', () => ({
  useAccount: () => ({ email: 'user@example.com' }),
  useAuthClient: () => mockAuthClient,
  useFtlMsgResolver: () => mockFtlMsgResolver,
}));

describe('MfaGuard', () => {
  beforeEach(() => {
    if (JwtTokenCache.hasToken(mockSessionToken, mockScope)) {
      JwtTokenCache.removeToken(mockSessionToken, mockScope);
    }
    jest.clearAllMocks();
  });

  it('requests OTP and shows modal when JWT missing', async () => {
    renderWithRouter(
      <MfaGuard requiredScope={mockScope}>
        <div>secured</div>
      </MfaGuard>
    );

    expect(mockAuthClient.mfaRequestOtp).toHaveBeenCalledWith(
      mockSessionToken,
      mockScope
    );

    expect(
      await screen.findByText('Enter confirmation code')
    ).toBeInTheDocument();

    // Submit a code to verify integration with onSubmit
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Enter 6-digit code' }),
      mockOtp
    );
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(mockAuthClient.mfaOtpVerify).toHaveBeenCalledWith(
      mockSessionToken,
      mockOtp,
      mockScope
    );
  });

  it('renders children when JWT exists', () => {
    JwtTokenCache.setToken(mockSessionToken, mockScope, 'jwt-present');

    renderWithRouter(
      <MfaGuard requiredScope={mockScope}>
        <div>secured</div>
      </MfaGuard>
    );

    expect(screen.getByText('secured')).toBeInTheDocument();
    expect(
      screen.queryByText('Enter confirmation code')
    ).not.toBeInTheDocument();
    expect(mockAuthClient.mfaRequestOtp).not.toHaveBeenCalled();
  });

  it('shows error banner on invalid OTP', async () => {
    renderWithRouter(
      <MfaGuard requiredScope={mockScope}>
        <div>secured</div>
      </MfaGuard>
    );

    expect(screen.queryByText('Enter confirmation code')).toBeInTheDocument();
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Enter 6-digit code' }),
      '654321'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(
      await screen.findByText('Invalid or expired confirmation code')
    ).toBeInTheDocument();
  });

  it('clears error banner on input change', async () => {
    renderWithRouter(
      <MfaGuard requiredScope={mockScope}>
        <div>secured</div>
      </MfaGuard>
    );

    expect(screen.getByText('Enter confirmation code')).toBeInTheDocument();
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Enter 6-digit code' }),
      '654321'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(
      await screen.findByText('Invalid or expired confirmation code')
    ).toBeInTheDocument();

    await userEvent.clear(screen.getByRole('textbox'));

    expect(
      screen.queryByText('Invalid or expired confirmation code')
    ).not.toBeInTheDocument();
  });
});
