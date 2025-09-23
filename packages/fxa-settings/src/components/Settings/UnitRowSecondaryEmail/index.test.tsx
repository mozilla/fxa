/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import React from 'react';
import { screen, fireEvent, act, waitFor } from '@testing-library/react';
import {
  renderWithRouter,
  mockEmail,
  mockAppContext,
  mockSettingsContext,
} from '../../../models/mocks';
import { createMockAccount } from './mocks';
import { UnitRowSecondaryEmail } from '.';
import { Account, AppContext } from '../../../models';
import { SettingsContext } from '../../../models/contexts/SettingsContext';
import { JwtTokenCache } from '../../../lib/cache';
import AuthClient from 'fxa-auth-client/lib/client';
import userEvent, { UserEvent } from '@testing-library/user-event';

const mockSessionToken = 'you-get-a-session-token';
const mockJwt = 'and-you-get-a-jwt';

jest.mock('../../../lib/cache', () => ({
  __esModule: true,
  ...jest.requireActual('../../../lib/cache'),
  sessionToken: () => mockSessionToken,
}));

const account = {
  emails: [mockEmail(), mockEmail('johndope2@example.com', false, false)],
  resendEmailCode: jest.fn().mockResolvedValue(true),
  makeEmailPrimary: jest.fn().mockResolvedValue(true),
  deleteSecondaryEmail: jest.fn().mockResolvedValue(true),
  refresh: jest.fn(),
} as unknown as Account;

jest.mock('../../../models/AlertBarInfo');
window.console.error = jest.fn();

afterAll(() => {
  (window.console.error as jest.Mock).mockReset();
});

describe('UnitRowSecondaryEmail', () => {
  describe('no secondary email set', () => {
    it('renders as expected', () => {
      const account = {
        emails: [mockEmail()],
      } as unknown as Account;
      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <UnitRowSecondaryEmail />
        </AppContext.Provider>
      );

      expect(
        screen.getByTestId('secondary-email-unit-row-header-value').textContent
      ).toContain('None');
      expect(
        screen.getByTestId('secondary-email-unit-row-route')
      ).toHaveAttribute('href', '/settings/emails');

      screen.getByText(
        'Access your account if you can’t log in to your primary email',
        { exact: false }
      );
      screen.getByText(
        'Note: a secondary email won’t restore your information',
        { exact: false }
      );
      expect(
        screen.getByTestId('secondary-email-link-recovery-key')
      ).toHaveAttribute('href', '#recovery-key');
    });
  });

  describe('one secondary email set', () => {
    it('renders as expected when unverified', () => {
      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <UnitRowSecondaryEmail />
        </AppContext.Provider>
      );

      expect(
        screen.getByTestId('secondary-email-unit-row-header-value').textContent
      ).toContain('johndope2@example.com');
      expect(
        screen.getByTestId('secondary-email-resend-code-button')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('secondary-email-unverified-text')
      ).toBeInTheDocument();
      expect(screen.getByTestId('secondary-email-delete')).toBeInTheDocument();
    });

    it('renders as expected when verified', () => {
      const account = {
        emails: [mockEmail(), mockEmail('johndope2@example.com', false)],
      } as unknown as Account;
      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <UnitRowSecondaryEmail />
        </AppContext.Provider>
      );

      expect(
        screen.queryByTestId('secondary-email-resend-code-button')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('secondary-email-unverified-text')
      ).not.toBeInTheDocument();
      expect(
        screen.getByTestId('secondary-email-default-content')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('secondary-email-make-primary')
      ).toBeInTheDocument();
      expect(screen.getByTestId('secondary-email-delete')).toBeInTheDocument();
    });

    it('can refresh', async () => {
      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <UnitRowSecondaryEmail />
        </AppContext.Provider>
      );

      expect(
        screen.getByTestId('secondary-email-unverified-text')
      ).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(screen.getByTestId('secondary-email-refresh'));
      });
      expect(account.refresh).toHaveBeenCalledWith('account');
    });
  });

  describe('multiple secondary emails set', () => {
    it('renders as expected and with verified email text only present on the last verified', () => {
      const emails = [
        mockEmail(),
        mockEmail('johndope2@example.com', false),
        mockEmail('johndope3@example.com', false),
        mockEmail('johndope4@example.com', false),
      ];
      const account = {
        emails,
      } as unknown as Account;
      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <UnitRowSecondaryEmail />
        </AppContext.Provider>
      );

      const unitRowHeaderValues = screen.getAllByTestId(
        'secondary-email-unit-row-header-value'
      );
      const secondaryEmails = emails.filter((email) => !email.isPrimary);

      expect(
        screen.getAllByTestId('secondary-email-make-primary')
      ).toHaveLength(3);
      expect(
        screen.getAllByTestId('secondary-email-default-content')
      ).toHaveLength(1);

      expect(
        screen.getByTestId('secondary-email-default-content')
      ).toBeInTheDocument();

      expect(unitRowHeaderValues).toHaveLength(3);
      secondaryEmails.forEach((email, index) => {
        expect(unitRowHeaderValues[index].textContent).toContain(email.email);
      });
    });

    it('renders multiple unverified as expected', () => {
      const emails = [
        mockEmail(),
        mockEmail('johndope2@example.com', false, false),
        mockEmail('johndope3@example.com', false),
        mockEmail('johndope4@example.com', false, false),
      ];
      const account = {
        emails,
      } as unknown as Account;
      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <UnitRowSecondaryEmail />
        </AppContext.Provider>
      );

      expect(
        screen.getAllByTestId('secondary-email-make-primary')
      ).toHaveLength(1);
      expect(
        screen.getAllByTestId('secondary-email-default-content')
      ).toHaveLength(1);
      expect(
        screen.getAllByTestId('secondary-email-resend-code-button')
      ).toHaveLength(2);
      expect(
        screen.getAllByTestId('secondary-email-unverified-text')
      ).toHaveLength(2);
      expect(screen.getAllByTestId('secondary-email-delete')).toHaveLength(3);
    });
  });

  describe('resendSecondaryEmailCode', () => {
    it('navigates to the emails/verify route on success', async () => {
      const primaryEmail = mockEmail('somethingdifferent@example.com');

      const emails = [
        { ...primaryEmail },
        mockEmail('johndope2@example.com', false, false),
      ];
      const account = {
        emails,
        resendEmailCode: jest.fn().mockResolvedValue(true),
      } as unknown as Account;

      const { history } = renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <UnitRowSecondaryEmail />
        </AppContext.Provider>
      );

      await act(async () => {
        fireEvent.click(
          screen.getByTestId('secondary-email-resend-code-button')
        );
      });

      expect(history.location.pathname).toEqual('/settings/emails/verify');
    });

    it('displays an error message in the AlertBar', async () => {
      const emails = [
        mockEmail(),
        mockEmail('johndope2@example.com', false, false),
      ];
      const account = {
        emails,
        resendEmailCode: jest.fn().mockRejectedValue(new Error()),
      } as unknown as Account;
      const context = mockAppContext({ account });
      const settingsContext = mockSettingsContext();
      renderWithRouter(
        <AppContext.Provider value={context}>
          <SettingsContext.Provider value={settingsContext}>
            <UnitRowSecondaryEmail />
          </SettingsContext.Provider>
        </AppContext.Provider>
      );

      await act(async () => {
        fireEvent.click(
          screen.getByTestId('secondary-email-resend-code-button')
        );
      });
      expect(settingsContext.alertBarInfo?.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('updatePrimaryEmail', () => {
    it('displays a success message in the AlertBar', async () => {
      const emails = [
        mockEmail('somethingdifferent@example.com'),
        mockEmail('johndope2@example.com', false, true),
      ];
      const account = {
        emails,
        makeEmailPrimary: jest.fn().mockResolvedValue(true),
      } as unknown as Account;
      const context = mockAppContext({ account });
      const settingsContext = mockSettingsContext();
      renderWithRouter(
        <AppContext.Provider value={context}>
          <SettingsContext.Provider value={settingsContext}>
            <UnitRowSecondaryEmail />
          </SettingsContext.Provider>
        </AppContext.Provider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('secondary-email-make-primary'));
      });
      expect(settingsContext.alertBarInfo?.success).toHaveBeenCalledTimes(1);
      expect(settingsContext.alertBarInfo?.success).toHaveBeenCalledWith(
        'johndope2@example.com is now your primary email'
      );
    });

    it('displays an error message in the AlertBar', async () => {
      const emails = [
        mockEmail(),
        mockEmail('johndope2@example.com', false, true),
      ];
      const account = {
        emails,
        makeEmailPrimary: jest.fn().mockRejectedValue(new Error()),
      } as unknown as Account;
      const context = mockAppContext({ account });
      const settingsContext = mockSettingsContext();
      renderWithRouter(
        <AppContext.Provider value={context}>
          <SettingsContext.Provider value={settingsContext}>
            <UnitRowSecondaryEmail />
          </SettingsContext.Provider>
        </AppContext.Provider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('secondary-email-make-primary'));
      });
      expect(settingsContext.alertBarInfo?.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteSecondaryEmail', () => {
    let user: UserEvent;
    const mockAuthClient = new AuthClient('http://localhost:9000');

    const setupMockAuthClient = () => {
      mockAuthClient.mfaRequestOtp = jest
        .fn()
        .mockResolvedValue({ code: 200, errno: 0 });
      mockAuthClient.mfaOtpVerify = jest
        .fn()
        .mockResolvedValue({ accessToken: mockJwt });
    };

    const resetJwtCache = () => {
      if (JwtTokenCache.hasToken(mockSessionToken, 'email')) {
        JwtTokenCache.removeToken(mockSessionToken, 'email');
      }
    };

    beforeEach(() => {
      jest.clearAllMocks();
      resetJwtCache();
      setupMockAuthClient();
      user = userEvent.setup();
    });
    /**
     * This test case also implicitly covers that the MfaGuard is not displayed
     * on success, so no need for a separate test for that specific case.
     */
    it('displays a success message in the AlertBar', async () => {
      JwtTokenCache.setToken(mockSessionToken, 'email', mockJwt);

      const emails = [
        mockEmail('somethingdifferent@example.com'),
        mockEmail('johndope2@example.com', false, false),
      ];
      const account = createMockAccount({
        deleteSecondaryEmailWithJwt: jest.fn().mockResolvedValue(true),
        emails,
      });

      const appCtx = mockAppContext({
        authClient: mockAuthClient as any,
        account,
      });
      const settingsContext = mockSettingsContext();
      renderWithRouter(
        <AppContext.Provider value={appCtx}>
          <SettingsContext.Provider value={settingsContext}>
            <UnitRowSecondaryEmail />
          </SettingsContext.Provider>
        </AppContext.Provider>
      );

      await user.click(screen.getByTestId('secondary-email-delete'));

      await waitFor(() =>
        expect(settingsContext.alertBarInfo?.success).toHaveBeenCalledTimes(1)
      );
      await waitFor(() =>
        expect(settingsContext.alertBarInfo?.success).toHaveBeenCalledWith(
          'johndope2@example.com successfully deleted'
        )
      );
    });

    it('displays an error message in the AlertBar', async () => {
      JwtTokenCache.setToken(mockSessionToken, 'email', mockJwt);

      const account = createMockAccount({
        deleteSecondaryEmailWithJwt: jest.fn().mockRejectedValue(new Error()),
      });
      const context = mockAppContext({
        authClient: mockAuthClient as any,
        account,
      });
      const settingsContext = mockSettingsContext();
      renderWithRouter(
        <AppContext.Provider value={context}>
          <SettingsContext.Provider value={settingsContext}>
            <UnitRowSecondaryEmail />
          </SettingsContext.Provider>
        </AppContext.Provider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('secondary-email-delete'));
      });
      expect(settingsContext.alertBarInfo?.error).toHaveBeenCalledTimes(1);
    });

    it('displays the MFA guard if the JWT is invalid', async () => {
      JwtTokenCache.setToken(mockSessionToken, 'email', 'invalid-jwt');

      const account = createMockAccount({
        deleteSecondaryEmailWithJwt: jest
          .fn()
          .mockRejectedValue({ code: 401, errno: 110 }),
      });

      const context = mockAppContext({
        authClient: mockAuthClient as any,
        account,
      });
      const settingsContext = mockSettingsContext();
      renderWithRouter(
        <AppContext.Provider value={context}>
          <SettingsContext.Provider value={settingsContext}>
            <UnitRowSecondaryEmail />
          </SettingsContext.Provider>
        </AppContext.Provider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('secondary-email-delete'));
      });

      expect(
        await screen.findByText('Enter confirmation code')
      ).toBeInTheDocument();
    });
  });
});
