/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { Account } from '../../../models';
import { logPageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT, SHOW_BALLOON_TIMEOUT } from '../../../constants';
import {
  getSubject,
  MOCK_RESET_DATA,
  mockCompleteResetPasswordParams,
  paramsWithMissingCode,
  paramsWithMissingEmail,
  paramsWithMissingEmailToHashWith,
  paramsWithMissingToken,
  paramsWithSyncDesktop,
} from './mocks';
import { notifyFirefoxOfLogin } from '../../../lib/channels/helpers';
import { renderWithRouter } from '../../../models/mocks';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';

const mockUseNavigateWithoutRerender = jest.fn();

jest.mock('../../../lib/hooks/useNavigateWithoutRerender', () => ({
  __esModule: true,
  default: () => mockUseNavigateWithoutRerender,
}));

const PASSWORD = 'passwordzxcv';

jest.mock('../../../lib/metrics', () => ({
  logPageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

let account: Account;
let lostRecoveryKey: boolean;
const mockNavigate = jest.fn();

const mockSearchParams = {
  email: mockCompleteResetPasswordParams.email,
  emailToHashWith: mockCompleteResetPasswordParams.emailToHashWith,
  token: mockCompleteResetPasswordParams.token,
  code: mockCompleteResetPasswordParams.code,
  uid: mockCompleteResetPasswordParams.uid,
};

const search = new URLSearchParams(mockSearchParams);

const mockLocation = () => {
  return {
    pathname: `/account_recovery_reset_password`,
    search,
    state: {
      lostRecoveryKey,
    },
  };
};

jest.mock('../../../lib/channels/helpers', () => {
  return {
    notifyFirefoxOfLogin: jest.fn(),
  };
});

jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation(),
}));

const renderSubject = (account: Account, params?: Record<string, string>) => {
  const { Subject, history, appCtx } = getSubject(account, params);
  return renderWithRouter(<Subject />, { history }, appCtx);
};

describe('CompleteResetPassword page', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  beforeEach(() => {
    lostRecoveryKey = false;

    account = {
      resetPasswordStatus: jest.fn().mockResolvedValue(true),
      completeResetPassword: jest.fn().mockResolvedValue(MOCK_RESET_DATA),
      hasRecoveryKey: jest.fn().mockResolvedValue(false),
      hasTotpAuthClient: jest.fn().mockResolvedValue(false),
      isSessionVerifiedAuthClient: jest.fn().mockResolvedValue(true),
    } as unknown as Account;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component as expected', async () => {
    renderSubject(account);
    // testAllL10n(screen, bundle);

    await screen.findByRole('heading', {
      name: 'Create new password',
    });
    screen.getByLabelText('New password');
    screen.getByLabelText('Re-enter password');
    screen.getByRole('button', { name: 'Reset password' });
    screen.getByRole('link', {
      name: 'Remember your password? Sign in',
    });
  });

  it('displays password requirements when the new password field is in focus', async () => {
    renderSubject(account);

    const newPasswordField = await screen.findByTestId(
      'new-password-input-field'
    );

    expect(screen.queryByText('Password requirements')).not.toBeInTheDocument();

    fireEvent.focus(newPasswordField);
    await waitFor(
      () => {
        expect(screen.getByText('Password requirements')).toBeVisible();
      },
      {
        timeout: SHOW_BALLOON_TIMEOUT,
      }
    );
  });

  it('renders the component as expected when provided with an expired link', async () => {
    account = {
      ...account,
      resetPasswordStatus: jest.fn().mockResolvedValue(false),
    } as unknown as Account;

    renderSubject(account);

    await screen.findByRole('heading', {
      name: 'Reset password link expired',
    });
    screen.getByText('The link you clicked to reset your password is expired.');
    screen.getByRole('button', {
      name: 'Receive new link',
    });
  });

  describe('renders the component as expected when provided with a damaged link', () => {
    let mockConsoleWarn: jest.SpyInstance;

    beforeEach(() => {
      // We expect that model bindings will warn us about missing / incorrect values.
      // We don't want these warnings to effect test output since they are expected, so we
      // will mock the function, and make sure it's called.
      mockConsoleWarn = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
    });

    afterEach(() => {
      mockConsoleWarn.mockClear();
    });

    it('with missing token', async () => {
      renderSubject(account, paramsWithMissingToken);

      await screen.findByRole('heading', {
        name: 'Reset password link damaged',
      });
      screen.getByText(
        'The link you clicked was missing characters, and may have been broken by your email client. Copy the address carefully, and try again.'
      );
      expect(mockConsoleWarn).toBeCalled();
    });
    it('with missing code', async () => {
      renderSubject(account, paramsWithMissingCode);

      await screen.findByRole('heading', {
        name: 'Reset password link damaged',
      });
      expect(mockConsoleWarn).toBeCalled();
    });
    it('with missing email', async () => {
      renderSubject(account, paramsWithMissingEmail);

      await screen.findByRole('heading', {
        name: 'Reset password link damaged',
      });
      expect(mockConsoleWarn).toBeCalled();
    });
  });

  // TODO in FXA-7630: check for metrics event when link is expired or damaged
  it('emits the expected metrics on render', async () => {
    renderSubject(account);

    await screen.findByRole('heading', {
      name: 'Create new password',
    });

    expect(logPageViewEvent).toHaveBeenCalledWith(
      'complete-reset-password',
      REACT_ENTRYPOINT
    );
  });

  describe('errors', () => {
    it('displays "problem setting your password" error', async () => {
      account = {
        hasRecoveryKey: jest.fn().mockResolvedValue(false),
        resetPasswordStatus: jest.fn().mockResolvedValue(true),
        completeResetPassword: jest
          .fn()
          .mockRejectedValue(new Error('Request failed')),
      } as unknown as Account;

      renderSubject(account);

      await waitFor(() => {
        fireEvent.input(screen.getByTestId('new-password-input-field'), {
          target: { value: PASSWORD },
        });
      });

      fireEvent.input(screen.getByTestId('verify-password-input-field'), {
        target: { value: PASSWORD },
      });

      fireEvent.click(screen.getByText('Reset password'));

      await screen.findByText(
        'Sorry, there was a problem setting your password'
      );
    });

    it('displays account recovery key check error', async () => {
      account = {
        resetPasswordStatus: jest.fn().mockResolvedValue(true),
        hasRecoveryKey: jest
          .fn()
          .mockRejectedValue(new Error('Request failed')),
      } as unknown as Account;

      renderSubject(account);

      await screen.findByText(
        'Sorry, there was a problem checking if you have an account recovery key.',
        { exact: false }
      );

      const useKeyLink = screen.getByRole('link', {
        name: 'Reset your password with your account recovery key.',
      });
      expect(useKeyLink).toHaveAttribute(
        'href',
        `/account_recovery_confirm_key${search}`
      );
    });
  });

  describe('account has recovery key', () => {
    const accountWithRecoveryKey = {
      resetPasswordStatus: jest.fn().mockResolvedValue(true),
      completeResetPassword: jest.fn().mockResolvedValue(MOCK_RESET_DATA),
      hasRecoveryKey: jest.fn().mockResolvedValue(true),
    } as unknown as Account;

    it('redirects as expected', async () => {
      lostRecoveryKey = false;
      renderSubject(accountWithRecoveryKey);

      screen.getByLabelText('Loading…');

      await waitFor(() =>
        expect(accountWithRecoveryKey.hasRecoveryKey).toHaveBeenCalledWith(
          mockCompleteResetPasswordParams.email
        )
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.stringContaining('/account_recovery_confirm_key'),
          {
            replace: true,
            state: { email: mockCompleteResetPasswordParams.email },
          }
        );
      });
    });

    it('does not check or redirect when state has lostRecoveryKey', async () => {
      lostRecoveryKey = true;
      renderSubject(accountWithRecoveryKey);
      // If recovery key reported as lost, default CompleteResetPassword page is rendered
      await screen.findByRole('heading', {
        name: 'Create new password',
      });
      expect(accountWithRecoveryKey.hasRecoveryKey).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('can submit', () => {
    async function enterPasswordAndSubmit() {
      await waitFor(() => {
        fireEvent.input(screen.getByTestId('new-password-input-field'), {
          target: { value: PASSWORD },
        });
      });
      fireEvent.input(screen.getByTestId('verify-password-input-field'), {
        target: { value: PASSWORD },
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Reset password'));
      });
    }

    it('calls expected functions', async () => {
      renderSubject(account);
      await enterPasswordAndSubmit();
      // Check that completeResetPassword was the first function called
      // because it retrieves the session token required by other calls
      expect(
        (account.completeResetPassword as jest.Mock).mock.calls[0]
      ).toBeTruthy();
      expect(account.isSessionVerifiedAuthClient).toHaveBeenCalled();
      expect(account.hasTotpAuthClient).toHaveBeenCalled();
    });

    it('submits with emailToHashWith if present', async () => {
      renderSubject(account);
      const { token, emailToHashWith, code } = mockCompleteResetPasswordParams;

      await enterPasswordAndSubmit();
      expect(account.completeResetPassword).toHaveBeenCalledWith(
        token,
        code,
        emailToHashWith,
        PASSWORD
      );
    });
    it('submits with email if emailToHashWith is missing', async () => {
      renderSubject(account, paramsWithMissingEmailToHashWith);
      const { token, email, code } = paramsWithMissingEmailToHashWith;

      await enterPasswordAndSubmit();
      expect(account.completeResetPassword).toHaveBeenCalledWith(
        token,
        code,
        email,
        PASSWORD
      );
    });

    describe('Web integration', () => {
      // Not needed once this page doesn't use `hardNavigateToContentServer`
      const originalWindow = window.location;
      beforeAll(() => {
        // @ts-ignore
        delete window.location;
        window.location = { ...originalWindow, href: '' };
      });
      beforeEach(() => {
        window.location.href = originalWindow.href;
      });
      afterAll(() => {
        window.location = originalWindow;
      });

      it('account has TOTP', async () => {
        account = {
          ...account,
          hasTotpAuthClient: jest.fn().mockResolvedValue(true),
        } as unknown as Account;

        renderSubject(account);
        await enterPasswordAndSubmit();

        expect(window.location.href).toContain('/signin_totp_code');
      });

      it('account does not have TOTP', async () => {
        renderSubject(account);
        await enterPasswordAndSubmit();
        expect(mockUseNavigateWithoutRerender).toHaveBeenCalledWith(
          '/reset_password_verified?email=johndope%40example.com&emailToHashWith=&token=1111111111111111111111111111111111111111111111111111111111111111&code=11111111111111111111111111111111&uid=abc123',
          {
            replace: true,
          }
        );
      });
    });
    describe('SyncDesktop integration', () => {
      it('calls notifyFirefoxOfLogin', async () => {
        renderSubject(account, paramsWithSyncDesktop);
        await enterPasswordAndSubmit();

        expect(notifyFirefoxOfLogin).toBeCalled();
      });
    });
  });
});
