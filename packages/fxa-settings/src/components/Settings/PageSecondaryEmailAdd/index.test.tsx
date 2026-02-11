/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, fireEvent, act, waitFor } from '@testing-library/react';
import { mockAppContext, renderWithRouter } from '../../../models/mocks';
import { PageSecondaryEmailAdd, MfaGuardPageSecondaryEmailAdd } from '.';
import { Account, AppContext } from '../../../models';
import { AuthUiErrors } from 'fxa-settings/src/lib/auth-errors/auth-errors';
import * as Metrics from '../../../lib/metrics';
import { resetOnce } from '../../../lib/utilities';
import userEvent, { UserEvent } from '@testing-library/user-event';
import AuthClient from 'fxa-auth-client/lib/client';
import { JwtTokenCache } from '../../../lib/cache';
import { MfaContext } from '../MfaGuard';

window.console.error = jest.fn();

const account = {
  createSecondaryEmail: jest.fn().mockResolvedValue(true),
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

afterAll(() => {
  (window.console.error as jest.Mock).mockReset();
});

afterEach(() => {
  resetOnce();
});

describe('PageSecondaryEmailAdd', () => {
  describe('no secondary email set', () => {
    it('renders as expected', () => {
      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <MfaContext.Provider value="email">
            <PageSecondaryEmailAdd />
          </MfaContext.Provider>
        </AppContext.Provider>
      );

      expect(screen.getByTestId('secondary-email-input').textContent).toContain(
        'Enter email address'
      );
      expect(screen.getByTestId('cancel-button').textContent).toContain(
        'Cancel'
      );
      expect(screen.getByTestId('save-button').textContent).toContain('Save');
    });

    it('Enables "save" button once valid email is input', () => {
      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <MfaContext.Provider value="email">
            <PageSecondaryEmailAdd />
          </MfaContext.Provider>
        </AppContext.Provider>
      );

      expect(screen.getByTestId('save-button')).toHaveAttribute('disabled');

      const input = screen.getByTestId('input-field');
      fireEvent.change(input, { target: { value: 'fake@example.com' } });

      expect(screen.getByTestId('save-button')).not.toHaveAttribute('disabled');
    });

    it('Do not Enable "save" button if invalid email is input', () => {
      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <MfaContext.Provider value="email">
            <PageSecondaryEmailAdd />
          </MfaContext.Provider>
        </AppContext.Provider>
      );

      const input = screen.getByTestId('input-field');
      fireEvent.change(input, { target: { value: 'fake@' } });

      expect(screen.getByTestId('save-button')).toHaveAttribute('disabled');
    });

    it('should display tooltip error when using email mask', async () => {
      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <MfaContext.Provider value="email">
            <PageSecondaryEmailAdd />
          </MfaContext.Provider>
        </AppContext.Provider>
      );

      const input = screen.getByTestId('input-field');
      fireEvent.change(input, { target: { value: 'user@mozmail.com' } });

      await act(async () => {
        fireEvent.click(screen.getByTestId('save-button'));
      });

      expect(screen.queryByTestId('tooltip')).toBeInTheDocument();
      expect(
        screen.queryByText('Email masks can’t be used as a secondary email')
      ).toBeInTheDocument();
    });
  });

  describe('createSecondaryEmailCode', () => {
    it('displays an error message in the tooltip', async () => {
      const error: any = new Error('Email Address already added');
      error.errno = AuthUiErrors.EMAIL_PRIMARY_EXISTS.errno;
      const account = {
        createSecondaryEmail: jest.fn().mockRejectedValue(error),
      } as unknown as Account;
      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <MfaContext.Provider value="email">
            <PageSecondaryEmailAdd />
          </MfaContext.Provider>
        </AppContext.Provider>
      );
      const input = screen.getByTestId('input-field');
      fireEvent.change(input, { target: { value: 'johndope2@example.com' } });

      await act(async () => {
        fireEvent.click(screen.getByTestId('save-button'));
      });

      expect(screen.queryByTestId('tooltip')).toBeInTheDocument();

      expect(
        screen.queryByText(AuthUiErrors.EMAIL_PRIMARY_EXISTS.message)
      ).toBeInTheDocument();
    });
  });

  describe('metrics', () => {
    let logViewEventSpy: jest.SpyInstance;
    let usePageViewEventSpy: jest.SpyInstance;

    beforeAll(() => {
      logViewEventSpy = jest
        .spyOn(Metrics, 'logViewEvent')
        .mockImplementation();
      usePageViewEventSpy = jest
        .spyOn(Metrics, 'usePageViewEvent')
        .mockImplementation();
    });

    afterEach(() => {
      logViewEventSpy.mockReset();
      usePageViewEventSpy.mockReset();
    });

    afterAll(() => {
      logViewEventSpy.mockRestore();
      usePageViewEventSpy.mockReset();
    });

    const createSecondaryEmail = async () => {
      const account = {
        createSecondaryEmail: jest.fn().mockResolvedValue(true),
      } as unknown as Account;

      renderWithRouter(
        <AppContext.Provider
          value={mockAppContext({
            account,
          })}
        >
          <MfaContext.Provider value="email">
            <PageSecondaryEmailAdd />
          </MfaContext.Provider>
        </AppContext.Provider>
      );

      const emailField = await screen.findByLabelText('Enter email address');
      fireEvent.input(emailField, {
        target: { value: 'johndope2@example.com' },
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await waitFor(() => expect(saveButton).toBeEnabled());
      fireEvent.click(saveButton);
    };

    it('emits page view and submit metrics events', async () => {
      await createSecondaryEmail();
      expect(logViewEventSpy).toHaveBeenCalledWith('settings.emails', 'submit');
      expect(usePageViewEventSpy).toHaveBeenCalledWith('settings.emails');
    });
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
      // VerifiedSessionGuard calls sessionStatus, so we need to mock it
      mockAuthClient.sessionStatus = jest.fn().mockResolvedValue({
        state: 'verified',
        details: {
          sessionVerified: true,
        },
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
          <MfaGuardPageSecondaryEmailAdd
            location={{ state: { email: mockEmail } } as any}
          />
        </AppContext.Provider>
      );

      expect(screen.getByTestId('secondary-email-input')).toBeInTheDocument();
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
          <MfaGuardPageSecondaryEmailAdd
            location={{ state: { email: mockEmail } } as any}
          />
        </AppContext.Provider>
      );

      expect(screen.getByText('Enter confirmation code')).toBeInTheDocument();
    });

    it('renders MFA guard if the JWT is invalid', async () => {
      // an invalid token should be picked up by the guard which will
      // "send" a new one and display the modal again.
      JwtTokenCache.setToken(mockSessionToken, requiredScope, 'invalid-jwt');
      account.createSecondaryEmail = jest.fn().mockRejectedValue({
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
          <MfaGuardPageSecondaryEmailAdd
            location={{ state: { email: mockEmail } } as any}
          />
        </AppContext.Provider>
      );

      await user.type(screen.getByLabelText('Enter email address'), mockEmail);
      await user.click(screen.getByTestId('save-button'));

      expect(account.createSecondaryEmail).toHaveBeenCalledWith(mockEmail);
      expect(
        await screen.findByText('Enter confirmation code')
      ).toBeInTheDocument();
    });
  });
});
