/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import {
  mockAppContext,
  mockSettingsContext,
  renderWithRouter,
} from '../../../models/mocks';
import { Account, AppContext } from '../../../models';
import { PageSecondaryEmailVerify, MfaGuardPageSecondaryEmailVerify } from '.';
import { WindowLocation } from '@reach/router';
import { AuthUiErrors } from 'fxa-settings/src/lib/auth-errors/auth-errors';
import { SettingsContext } from '../../../models/contexts/SettingsContext';
import { MfaContext } from '../MfaGuard';
import { JwtTokenCache } from '../../../lib/cache';
import AuthClient from 'fxa-auth-client/lib/client';
import userEvent, { UserEvent } from '@testing-library/user-event';

const mockLocation = {
  state: { email: 'johndope@example.com' },
} as unknown as WindowLocation;

const account = {
  verifySecondaryEmail: jest.fn().mockResolvedValue(true),
} as unknown as Account;

const mockSessionToken = 'you-get-a-session-token';
const mockJwt = 'you-get-a-jwt';
const requiredScope = 'email';

jest.mock('../../../lib/cache', () => {
  const actual = jest.requireActual('../../../lib/cache');
  return {
    __esModule: true,
    ...actual,
    sessionToken: () => mockSessionToken,
  };
});

window.console.error = jest.fn();

afterAll(() => {
  (window.console.error as jest.Mock).mockReset();
});

describe('PageSecondaryEmailVerify', () => {
  it('renders as expected', () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <MfaContext.Provider value="email">
          <PageSecondaryEmailVerify location={mockLocation} />
        </MfaContext.Provider>
      </AppContext.Provider>
    );

    expect(
      screen.getByTestId('secondary-email-verify-form')
    ).toBeInTheDocument();
  });

  it('disables resend while request is in-flight and shows disabled styling', async () => {
    let resolveResend: (() => void) | undefined;
    const customAccount = {
      ...(account as any),
      loading: false,
      resendSecondaryEmailCodeWithJwt: jest.fn().mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveResend = resolve;
          })
      ),
    } as unknown as Account;

    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account: customAccount })}>
        <MfaContext.Provider value="email">
          <PageSecondaryEmailVerify location={mockLocation} />
        </MfaContext.Provider>
      </AppContext.Provider>
    );

    const btn = screen.getByTestId('secondary-email-resend-code-button');
    expect(btn).toBeEnabled();
    await act(async () => {
      fireEvent.click(btn);
    });
    expect(btn).toBeDisabled();
    expect(btn).toHaveClass('cursor-not-allowed');

    // Finish the pending request
    await act(async () => {
      resolveResend && resolveResend();
    });
  });

  it('disables resend during cooldown and re-enables after cooldown', async () => {
    jest.useFakeTimers();
    const customAccount = {
      ...(account as any),
      loading: false,
      resendSecondaryEmailCodeWithJwt: jest.fn().mockResolvedValue(undefined),
    } as unknown as Account;

    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account: customAccount })}>
        <MfaContext.Provider value="email">
          <PageSecondaryEmailVerify location={mockLocation} />
        </MfaContext.Provider>
      </AppContext.Provider>
    );

    const btn = screen.getByTestId('secondary-email-resend-code-button');
    await act(async () => {
      fireEvent.click(btn);
    });
    expect(btn).toBeDisabled();
    await act(async () => {
      jest.advanceTimersByTime(2999);
    });
    expect(btn).toBeDisabled();
    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(btn).toBeEnabled();
    jest.useRealTimers();
  });

  it('disables resend while verification is in progress (account.loading)', () => {
    const customAccount = {
      ...(account as any),
      loading: true,
      resendSecondaryEmailCodeWithJwt: jest.fn(),
    } as unknown as Account;

    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account: customAccount })}>
        <MfaContext.Provider value="email">
          <PageSecondaryEmailVerify location={mockLocation} />
        </MfaContext.Provider>
      </AppContext.Provider>
    );
    const btn = screen.getByTestId('secondary-email-resend-code-button');
    expect(btn).toBeDisabled();
  });

  it('renders error messages', async () => {
    const error: any = new Error();
    error.errno = AuthUiErrors.INVALID_VERIFICATION_CODE.errno;
    const account = {
      verifySecondaryEmail: jest.fn().mockRejectedValue(error),
    } as unknown as Account;
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <MfaContext.Provider value="email">
          <PageSecondaryEmailVerify location={mockLocation} />
        </MfaContext.Provider>
      </AppContext.Provider>
    );

    await act(async () => {
      fireEvent.input(screen.getByTestId('verification-code-input-field'), {
        target: { value: '666666' },
      });
    });

    await act(async () =>
      screen.getByTestId('secondary-email-verify-submit').click()
    );

    expect(screen.getByTestId('tooltip').textContent).toContain(
      AuthUiErrors.INVALID_VERIFICATION_CODE.message
    );
  });

  it('navigates to settings and shows a message on success', async () => {
    const alertBarInfo = {
      success: jest.fn(),
    } as any;
    const settingsContext = mockSettingsContext({ alertBarInfo });
    const { history } = renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <SettingsContext.Provider value={settingsContext}>
          <MfaContext.Provider value="email">
            <PageSecondaryEmailVerify location={mockLocation} />
          </MfaContext.Provider>
        </SettingsContext.Provider>
      </AppContext.Provider>
    );

    await act(async () => {
      fireEvent.input(screen.getByTestId('verification-code-input-field'), {
        target: { value: '123456' },
      });
    });

    await act(async () =>
      screen.getByTestId('secondary-email-verify-submit').click()
    );

    expect(history.location.pathname).toEqual('/settings#secondary-email');
    expect(alertBarInfo.success).toHaveBeenCalledTimes(1);
    expect(alertBarInfo.success).toHaveBeenCalledWith(
      'johndope@example.com successfully added'
    );
  });

  describe('MfaGuard', () => {
    const mockEmail = 'user@example.com';
    const mockAuthClient = new AuthClient('http://localhost:9000');
    let user: UserEvent;

    const setupMockAuthClient = () => {
      mockAuthClient.mfaRequestOtp = jest
        .fn()
        .mockResolvedValueOnce({ code: 200, errno: 0 });
      mockAuthClient.mfaOtpVerify = jest
        .fn()
        .mockResolvedValueOnce({ accessToken: mockJwt });
    };

    const resetJwtCache = () => {
      if (JwtTokenCache.hasToken(mockSessionToken, requiredScope)) {
        JwtTokenCache.removeToken(mockSessionToken, requiredScope);
      }
    };

    beforeEach(() => {
      jest.clearAllMocks();
      resetJwtCache();
      setupMockAuthClient();
      user = userEvent.setup();
    });

    it('renders correctly when JWT exists and is valid', () => {
      JwtTokenCache.setToken(mockSessionToken, requiredScope, mockJwt);
      const appCtx = mockAppContext({
        authClient: mockAuthClient as any,
        account: { ...(account as any), email: mockEmail },
      });

      renderWithRouter(
        <AppContext.Provider value={appCtx}>
          <MfaGuardPageSecondaryEmailVerify
            location={{ state: { email: mockEmail } } as any}
          />
        </AppContext.Provider>
      );

      expect(
        screen.getByTestId('secondary-email-verify-form')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Enter confirmation code')
      ).not.toBeInTheDocument();
      expect(mockAuthClient.mfaRequestOtp).not.toHaveBeenCalled();
    });

    it('renders MFA guard if JWT does not exist', () => {
      const appCtx = mockAppContext({
        authClient: mockAuthClient as any,
        account: { ...(account as any), email: mockEmail },
      });

      renderWithRouter(
        <AppContext.Provider value={appCtx}>
          <MfaGuardPageSecondaryEmailVerify
            location={{ state: { email: mockEmail } } as any}
          />
        </AppContext.Provider>
      );

      expect(screen.getByText('Enter confirmation code')).toBeInTheDocument();
    });

    it('renders MFA guard if the JWT is invalid on verify secondary email request', async () => {
      // an invalid token should be picked up by the guard which will
      // "send" a new one and display the modal again.
      JwtTokenCache.setToken(mockSessionToken, requiredScope, 'invalid-jwt');
      account.verifySecondaryEmail = jest.fn().mockRejectedValue({
        code: 401,
        errno: 223,
        message: 'Invalid or expired MFA token',
      });
      const appCtx = mockAppContext({
        authClient: mockAuthClient as any,
        account: { ...(account as any), email: mockEmail },
      });

      renderWithRouter(
        <AppContext.Provider value={appCtx}>
          <MfaGuardPageSecondaryEmailVerify
            location={{ state: { email: mockEmail } } as any}
          />
        </AppContext.Provider>
      );

      // mock the submit for the verification code, which should trigger the MFA guard
      // because the JWT is considered invalid server-side.
      await user.type(
        screen.getByTestId('verification-code-input-field'),
        '123456'
      );
      await user.click(screen.getByTestId('secondary-email-verify-submit'));

      expect(account.verifySecondaryEmail).toHaveBeenCalledWith(
        mockEmail,
        '123456'
      );
      expect(
        await screen.findByText('Enter confirmation code')
      ).toBeInTheDocument();
    });

    it('renders MFA guard if the JWT is invalid on resend code request', async () => {
      JwtTokenCache.setToken(mockSessionToken, requiredScope, 'invalid-jwt');
      account.resendSecondaryEmailCodeWithJwt = jest.fn().mockRejectedValue({
        code: 401,
        errno: 223,
        message: 'Invalid or expired MFA token',
      });
      const appCtx = mockAppContext({
        authClient: mockAuthClient as any,
        account: { ...(account as any), email: mockEmail },
      });
      renderWithRouter(
        <AppContext.Provider value={appCtx}>
          <MfaGuardPageSecondaryEmailVerify
            location={{ state: { email: mockEmail } } as any}
          />
        </AppContext.Provider>
      );
      await user.click(
        screen.getByRole('button', { name: 'Resend confirmation code' })
      );
      expect(account.resendSecondaryEmailCodeWithJwt).toHaveBeenCalledWith(
        mockEmail
      );
      expect(
        await screen.findByRole('heading', { name: /Enter confirmation code/ })
      ).toBeInTheDocument();
    });
  });
});
