/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { Account } from '../../../models';
import { logPageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT, SHOW_BALLOON_TIMEOUT } from '../../../constants';
import {
  mockCompleteResetPasswordParams,
  paramsWithMissingCode,
  paramsWithMissingEmail,
  paramsWithMissingEmailToHashWith,
  paramsWithMissingToken,
  Subject,
} from './mocks';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';

const mockUseNavigateWithoutRerender = jest.fn();

jest.mock('../../../lib/hooks/useNavigateWithoutRerender', () => ({
  __esModule: true,
  default: () => mockUseNavigateWithoutRerender,
}));

const PASSWORD = 'passwordzxcv';

jest.mock('../../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  logPageViewEvent: jest.fn(),
}));

let account: Account;
let lostRecoveryKey: boolean;
const mockNavigate = jest.fn();

const mockLocation = () => {
  return {
    state: {
      lostRecoveryKey,
    },
  };
};

jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation(),
}));

function renderSubject(account: Account, params?: Record<string, string>) {
  render(<Subject {...{ account, params }} />);
}

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
      completeResetPassword: jest.fn().mockResolvedValue(true),
      hasRecoveryKey: jest.fn().mockResolvedValue(false),
    } as unknown as Account;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component as expected', () => {
    renderSubject(account);
    // testAllL10n(screen, bundle);

    screen.getByRole('heading', {
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

    const newPasswordField = screen.getByTestId('new-password-input-field');

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
    it('with missing token', async () => {
      renderSubject(account, paramsWithMissingToken);

      await screen.findByRole('heading', {
        name: 'Reset password link damaged',
      });
      screen.getByText(
        'The link you clicked was missing characters, and may have been broken by your email client. Copy the address carefully, and try again.'
      );
    });
    it('with missing code', async () => {
      renderSubject(account, paramsWithMissingCode);

      await screen.findByRole('heading', {
        name: 'Reset password link damaged',
      });
    });
    it('with missing email', async () => {
      renderSubject(account, paramsWithMissingEmail);

      await screen.findByRole('heading', {
        name: 'Reset password link damaged',
      });
    });
  });

  // TODO : check for metrics event when link is expired or damaged
  it('emits the expected metrics on render', () => {
    renderSubject(account);

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

      fireEvent.input(screen.getByTestId('new-password-input-field'), {
        target: { value: PASSWORD },
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

      // TODO: fix in FXA-7051
      // expect(
      //   screen.queryByRole('link', {
      //     name: 'Reset your password with your account recovery key.',
      //   })
      // ).toHaveAttribute(
      //   'href',
      //   `/account_recovery_confirm_key${getSearchWithParams({
      //     mockToken,
      //     mockCode,
      //     mockEmail,
      //     mockPasswordHash,
      //   })}`
      // );
    });
  });

  describe('account has recovery key', () => {
    account = {
      resetPasswordStatus: jest.fn().mockResolvedValue(true),
      completeResetPassword: jest.fn().mockResolvedValue(true),
      hasRecoveryKey: jest.fn().mockResolvedValue(true),
    } as unknown as Account;

    it('redirects as expected', () => {
      account = {
        resetPasswordStatus: jest.fn().mockResolvedValue(true),
        completeResetPassword: jest.fn().mockResolvedValue(true),
        hasRecoveryKey: jest.fn().mockResolvedValue(true),
      } as unknown as Account;

      renderSubject(account);

      expect(account.hasRecoveryKey).toHaveBeenCalledWith(
        mockCompleteResetPasswordParams.email
      );

      // TODO: y u no pass?
      // expect(mockNavigate).toHaveBeenCalledWith(
      //   `/account_recovery_confirm_key${getSearch({
      //     mockToken,
      //     mockCode,
      //     mockEmail,
      //     mockPasswordHash,
      //   })}`,
      //   {
      //     replace: true,
      //   }
      // );
    });

    it('does not check or redirect when state has lostRecoveryKey', () => {
      lostRecoveryKey = true;
      renderSubject(account);

      expect(account.hasRecoveryKey).not.toHaveBeenCalled();

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('can submit', () => {
    async function enterPasswordAndSubmit() {
      fireEvent.input(screen.getByTestId('new-password-input-field'), {
        target: { value: PASSWORD },
      });

      fireEvent.input(screen.getByTestId('verify-password-input-field'), {
        target: { value: PASSWORD },
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Reset password'));
      });
    }

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
      expect(mockUseNavigateWithoutRerender).toHaveBeenCalledWith(
        '/reset_password_verified',
        {
          replace: true,
        }
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
  });
});
