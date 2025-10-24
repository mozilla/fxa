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
        <PageSecondaryEmailVerify location={mockLocation} />
      </AppContext.Provider>
    );

    expect(
      screen.getByTestId('secondary-email-verify-form')
    ).toBeInTheDocument();
  });

  it('renders error messages', async () => {
    const error: any = new Error();
    error.errno = AuthUiErrors.INVALID_VERIFICATION_CODE.errno;
    const account = {
      verifySecondaryEmail: jest.fn().mockRejectedValue(error),
    } as unknown as Account;
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <PageSecondaryEmailVerify location={mockLocation} />
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
          <PageSecondaryEmailVerify location={mockLocation} />
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
      mockAuthClient.sessionStatus = jest.fn().mockResolvedValue({
        details: { sessionVerificationMeetsMinimumAAL: true },
      });
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

    it('renders MFA guard if JWT does not exist', async () => {
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
        await screen.findByText('Enter confirmation code')
      ).toBeInTheDocument();
    });

    it('renders MFA guard if the JWT is invalid', async () => {
      // an invalid token should be picked up by the guard which will
      // "send" a new one and display the modal again.
      JwtTokenCache.setToken(mockSessionToken, requiredScope, 'invalid-jwt');
      account.verifySecondaryEmail = jest
        .fn()
        .mockRejectedValue({ code: 401, errno: 110 });
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
  });
});
