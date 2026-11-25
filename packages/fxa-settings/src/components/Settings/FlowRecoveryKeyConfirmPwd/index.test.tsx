/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { logViewEvent } from '../../../lib/metrics';
import FlowRecoveryKeyConfirmPwd from './';
import {
  mockAppContext,
  MOCK_ACCOUNT,
  renderWithRouter,
} from '../../../models/mocks';
import AuthClient from 'fxa-auth-client/browser';
import { Account, AppContext } from '../../../models';
import { MfaContext } from '../../../lib/hooks';
import * as AccountStorage from '../../../lib/account-storage';
import {
  MOCK_RECOVERY_KEY_JWT,
  mockAccountWithoutRecoveryKey,
  mockAccountWithRecoveryKey,
} from './mocks';
import {
  AuthUiError,
  AuthUiErrors,
} from '../../../lib/auth-errors/auth-errors';
import GleanMetrics from '../../../lib/glean';

const localizedBackButtonTitle = 'Back to settings';
const localizedPageTitle = 'Account Recovery Key';
const navigateForward = jest.fn();
const navigateBackward = jest.fn();
const viewName = 'settings.account-recovery';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    recoveryKey: {
      passwordView: jest.fn(),
      success: jest.fn(),
      error: jest.fn(),
    },
  },
}));

jest.mock('base32-encode', () =>
  jest.fn().mockReturnValue('00000000000000000000000000000000')
);

const setFormattedRecoveryKey = jest.fn();

jest.mock('fxa-auth-client/browser', () => ({
  ...jest.requireActual('fxa-auth-client/browser'),
  generateRecoveryKey: jest.fn().mockResolvedValue({
    recoveryKey: new Uint8Array(20),
    recoveryKeyId: 'newRecoveryKeyId',
    recoveryData: 'newRecoveryData',
  }),
}));

const mockAuthClient = {
  accountEmails: jest.fn(),
  sessionReauth: jest.fn(),
  accountKeys: jest.fn(),
  createRecoveryKeyWithJwt: jest.fn(),
};

jest.mock('../../../lib/cache', () => ({
  ...jest.requireActual('../../../lib/cache'),
  sessionToken: () => 'sessionToken',
}));

const accountWithoutKey = mockAccountWithoutRecoveryKey;
const accountWithKey = mockAccountWithRecoveryKey;

const mockReauthError = (error: AuthUiError) => {
  mockAuthClient.sessionReauth.mockRejectedValue(
    error.errno === AuthUiErrors.THROTTLED.errno
      ? { ...error, retryAfterLocalized: '15 minutes' }
      : error
  );
};

const renderFlowPage = (account: Account) => {
  renderWithRouter(
    <AppContext.Provider
      value={mockAppContext({
        account,
        authClient: mockAuthClient as unknown as AuthClient,
      })}
    >
      <MfaContext.Provider value="recovery_key">
        <FlowRecoveryKeyConfirmPwd
          {...{
            localizedBackButtonTitle,
            localizedPageTitle,
            navigateForward,
            navigateBackward,
            setFormattedRecoveryKey,
            viewName,
          }}
        />
      </MfaContext.Provider>
    </AppContext.Provider>
  );
};

const submitPassword = async (buttonName: string) => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Enter your password'), 'anypassword');
  await user.click(screen.getByRole('button', { name: buttonName }));
};

describe('FlowRecoveryKeyConfirmPwd', () => {
  let updateSpy: jest.SpyInstance;

  beforeEach(() => {
    updateSpy = jest.spyOn(AccountStorage, 'updateExtendedAccountState');
    mockAuthClient.accountEmails.mockResolvedValue({
      primary: MOCK_ACCOUNT.primaryEmail.email,
      original: MOCK_ACCOUNT.primaryEmail.email,
    });
    mockAuthClient.sessionReauth.mockResolvedValue({
      keyFetchToken: 'keyFetchToken',
      unwrapBKey: 'unwrapBKey',
    });
    mockAuthClient.accountKeys.mockResolvedValue({ kA: 'kA', kB: 'kB' });
    mockAuthClient.createRecoveryKeyWithJwt.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
    updateSpy.mockRestore();
  });

  describe('Glean events', () => {
    it('records the password view once and tags the submit button', () => {
      renderFlowPage(accountWithoutKey);
      expect(GleanMetrics.recoveryKey.passwordView).toHaveBeenCalledTimes(1);
      expect(
        screen.getByRole('button', { name: 'Create account recovery key' })
      ).toHaveAttribute('data-glean-id', 'recovery_key_password_submit');
    });

    it('tags the cancel link when the key is changed', async () => {
      renderFlowPage(accountWithKey);
      expect(
        await screen.findByRole('link', { name: 'Cancel' })
      ).toHaveAttribute('data-glean-id', 'recovery_key_password_cancel');
    });

    it('records success with the settings flow after the key is created', async () => {
      renderFlowPage(accountWithoutKey);
      await submitPassword('Create account recovery key');

      await waitFor(() => expect(navigateForward).toHaveBeenCalled());
      expect(GleanMetrics.recoveryKey.success).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.recoveryKey.success).toHaveBeenCalledWith({
        event: { flow: 'settings' },
      });
      expect(GleanMetrics.recoveryKey.error).not.toHaveBeenCalled();
    });

    it('records an error with a categorized reason when creation fails', async () => {
      mockReauthError(AuthUiErrors.THROTTLED);
      renderFlowPage(accountWithoutKey);
      await submitPassword('Create account recovery key');

      await waitFor(() =>
        expect(GleanMetrics.recoveryKey.error).toHaveBeenCalledTimes(1)
      );
      expect(GleanMetrics.recoveryKey.error).toHaveBeenCalledWith({
        event: { flow: 'settings', reason: 'throttled' },
      });
      expect(GleanMetrics.recoveryKey.success).not.toHaveBeenCalled();
    });

    it('records no error when the MFA guard handles the error', async () => {
      mockAuthClient.createRecoveryKeyWithJwt.mockRejectedValue(
        AuthUiErrors.INVALID_MFA_TOKEN
      );
      renderFlowPage(accountWithoutKey);
      await submitPassword('Create account recovery key');

      await waitFor(() =>
        expect(mockAuthClient.createRecoveryKeyWithJwt).toHaveBeenCalled()
      );
      expect(GleanMetrics.recoveryKey.error).not.toHaveBeenCalled();
    });
  });

  describe('with no key enabled', () => {
    it('renders as expected', async () => {
      renderFlowPage(accountWithoutKey);

      screen.getByRole('heading', {
        name: 'Re-enter your password for security',
      });
      screen.getByLabelText('Enter your password');
      screen.getByRole('button', { name: 'Create account recovery key' });
      expect(
        screen.queryByRole('link', { name: 'Cancel' })
      ).not.toBeInTheDocument();
    });

    it('disables the submit button when the input is empty', async () => {
      renderFlowPage(accountWithoutKey);
      const createRecoveryKeyButton = screen.getByRole('button', {
        name: 'Create account recovery key',
      });
      const passwordInput = screen.getByLabelText('Enter your password');
      expect(createRecoveryKeyButton).toHaveAttribute('disabled');
      // input a password to enable form submission
      fireEvent.input(passwordInput, {
        target: { value: 'anypassword' },
      });
      await waitFor(() =>
        expect(createRecoveryKeyButton).not.toHaveAttribute('disabled')
      );
      // clear password input disables the submit button
      fireEvent.input(passwordInput, {
        target: { value: '' },
      });
      await waitFor(() =>
        expect(createRecoveryKeyButton).toHaveAttribute('disabled')
      );
    });

    it('emits the expected metrics when the form is submitted with success', async () => {
      renderFlowPage(accountWithoutKey);
      const createRecoveryKeyButton = screen.getByRole('button', {
        name: 'Create account recovery key',
      });
      const passwordInput = screen.getByLabelText('Enter your password');
      // input a password to enable form submission
      fireEvent.input(passwordInput, {
        target: { value: 'anypassword' },
      });
      await waitFor(() =>
        expect(createRecoveryKeyButton).not.toHaveAttribute('disabled')
      );
      fireEvent.click(createRecoveryKeyButton);
      await waitFor(() => {
        expect(logViewEvent).toHaveBeenCalledWith(
          `flow.${viewName}`,
          'confirm-password.submit'
        );
        expect(logViewEvent).toHaveBeenCalledWith(
          `flow.${viewName}`,
          'confirm-password.success'
        );
        expect(navigateForward).toHaveBeenCalledTimes(1);
      });
    });

    it('creates the recovery key with the MFA JWT', async () => {
      renderFlowPage(accountWithoutKey);
      await submitPassword('Create account recovery key');

      await waitFor(() =>
        expect(mockAuthClient.createRecoveryKeyWithJwt).toHaveBeenCalledWith(
          MOCK_RECOVERY_KEY_JWT,
          'newRecoveryKeyId',
          'newRecoveryData',
          true,
          false
        )
      );
    });

    it('records the new key in the account cache', async () => {
      renderFlowPage({
        ...accountWithoutKey,
        recoveryKey: { exists: false, estimatedSyncDeviceCount: 2 },
      } as unknown as Account);
      await submitPassword('Create account recovery key');

      await waitFor(() =>
        expect(updateSpy).toHaveBeenCalledWith({
          recoveryKey: { exists: true, estimatedSyncDeviceCount: 2 },
        })
      );
    });

    it('hands an invalid MFA JWT to the MFA guard without an error banner', async () => {
      mockAuthClient.createRecoveryKeyWithJwt.mockRejectedValue(
        AuthUiErrors.INVALID_MFA_TOKEN
      );
      renderFlowPage(accountWithoutKey);
      await submitPassword('Create account recovery key');

      await waitFor(() =>
        expect(mockAuthClient.createRecoveryKeyWithJwt).toHaveBeenCalled()
      );
      expect(logViewEvent).not.toHaveBeenCalledWith(
        `flow.${viewName}`,
        'confirm-password.fail'
      );
      expect(navigateForward).not.toHaveBeenCalled();
    });

    it('renders an error message when the requests are throttled', async () => {
      mockReauthError(AuthUiErrors.THROTTLED);
      renderFlowPage(accountWithoutKey);
      const createRecoveryKeyButton = screen.getByRole('button', {
        name: 'Create account recovery key',
      });
      const passwordInput = screen.getByLabelText('Enter your password');
      // input a password to enable form submission
      fireEvent.input(passwordInput, {
        target: { value: 'anypassword' },
      });
      await waitFor(() =>
        expect(createRecoveryKeyButton).not.toHaveAttribute('disabled')
      );
      fireEvent.click(createRecoveryKeyButton);
      await waitFor(() => {
        screen.getByText(/You’ve tried too many times/);
        expect(logViewEvent).toHaveBeenCalledWith(
          `flow.${viewName}`,
          'confirm-password.submit'
        );
        expect(logViewEvent).toHaveBeenCalledWith(
          `flow.${viewName}`,
          'confirm-password.fail'
        );
        expect(navigateForward).not.toHaveBeenCalled();
      });
    });

    it('renders an error message when the password is incorrect', async () => {
      mockReauthError(AuthUiErrors.INCORRECT_PASSWORD);
      renderFlowPage(accountWithoutKey);
      const createRecoveryKeyButton = screen.getByRole('button', {
        name: 'Create account recovery key',
      });
      const passwordInput = screen.getByLabelText('Enter your password');
      // input a password to enable form submission
      fireEvent.input(passwordInput, {
        target: { value: 'anypassword' },
      });
      await waitFor(() =>
        expect(createRecoveryKeyButton).not.toHaveAttribute('disabled')
      );
      fireEvent.click(createRecoveryKeyButton);
      await waitFor(() => {
        screen.getByText('Incorrect password');
        expect(logViewEvent).toHaveBeenCalledWith(
          `flow.${viewName}`,
          'confirm-password.submit'
        );
        expect(logViewEvent).toHaveBeenCalledWith(
          `flow.${viewName}`,
          'confirm-password.fail'
        );
        expect(navigateForward).not.toHaveBeenCalled();
      });
    });

    it('shows INCORRECT_EMAIL_CASE as the incorrect-password tooltip', async () => {
      const user = userEvent.setup();
      mockReauthError(AuthUiErrors.INCORRECT_EMAIL_CASE);
      renderFlowPage(accountWithoutKey);

      await user.type(
        screen.getByLabelText('Enter your password'),
        'anypassword'
      );
      await user.click(
        screen.getByRole('button', { name: 'Create account recovery key' })
      );

      expect(await screen.findByTestId('tooltip')).toHaveTextContent(
        'Incorrect password'
      );
    });

    it('renders an error message for unexpected errors', async () => {
      mockReauthError(AuthUiErrors.UNEXPECTED_ERROR);
      renderFlowPage(accountWithoutKey);
      const createRecoveryKeyButton = screen.getByRole('button', {
        name: 'Create account recovery key',
      });
      const passwordInput = screen.getByLabelText('Enter your password');
      // input a password to enable form submission
      fireEvent.input(passwordInput, {
        target: { value: 'anypassword' },
      });
      await waitFor(() =>
        expect(createRecoveryKeyButton).not.toHaveAttribute('disabled')
      );
      fireEvent.click(createRecoveryKeyButton);
      await waitFor(() => {
        screen.getByText('Unexpected error');
        expect(logViewEvent).toHaveBeenCalledWith(
          `flow.${viewName}`,
          'confirm-password.submit'
        );
        expect(logViewEvent).toHaveBeenCalledWith(
          `flow.${viewName}`,
          'confirm-password.fail'
        );
        expect(navigateForward).not.toHaveBeenCalled();
      });
    });

    it('emits the expected metrics when user navigates back', () => {
      renderFlowPage(accountWithoutKey);
      fireEvent.click(screen.getByTestId('flow-container-back-btn'));
      expect(navigateBackward).toHaveBeenCalledTimes(1);
      expect(logViewEvent).toHaveBeenCalledWith(
        `flow.${viewName}`,
        'create-key.cancel'
      );
    });
  });

  describe('with an account recovery key enabled', () => {
    it('renders as expected', async () => {
      renderFlowPage(accountWithKey);

      screen.getByRole('heading', {
        name: 'Re-enter your password for security',
      });
      screen.getByLabelText('Enter your password');
      screen.getByRole('button', { name: 'Create new account recovery key' });
      screen.getByRole('link', { name: 'Cancel' });
    });

    it('disables the submit button when the input is empty', async () => {
      renderFlowPage(accountWithKey);
      const createRecoveryKeyButton = screen.getByRole('button', {
        name: 'Create new account recovery key',
      });
      const passwordInput = screen.getByLabelText('Enter your password');
      expect(createRecoveryKeyButton).toHaveAttribute('disabled');
      // input a password to enable form submission
      fireEvent.input(passwordInput, {
        target: { value: 'anypassword' },
      });
      await waitFor(() =>
        expect(createRecoveryKeyButton).not.toHaveAttribute('disabled')
      );
      // clear password input disables the submit button
      fireEvent.input(passwordInput, {
        target: { value: '' },
      });
      await waitFor(() =>
        expect(createRecoveryKeyButton).toHaveAttribute('disabled')
      );
    });

    it('emits the expected metrics when the form is submitted with success', async () => {
      renderFlowPage(accountWithKey);
      const createRecoveryKeyButton = screen.getByRole('button', {
        name: 'Create new account recovery key',
      });
      const passwordInput = screen.getByLabelText('Enter your password');
      // input a password to enable form submission
      fireEvent.input(passwordInput, {
        target: { value: 'anypassword' },
      });
      await waitFor(() =>
        expect(createRecoveryKeyButton).not.toHaveAttribute('disabled')
      );
      fireEvent.click(createRecoveryKeyButton);
      await waitFor(() => {
        expect(logViewEvent).toHaveBeenCalledWith(
          `flow.${viewName}`,
          'confirm-password.submit'
        );
        expect(logViewEvent).toHaveBeenCalledWith(
          `flow.${viewName}`,
          'confirm-password.success'
        );
        expect(navigateForward).toHaveBeenCalledTimes(1);
      });
    });

    it('replaces the existing recovery key', async () => {
      renderFlowPage(accountWithKey);
      await submitPassword('Create new account recovery key');

      await waitFor(() =>
        expect(mockAuthClient.createRecoveryKeyWithJwt).toHaveBeenCalledWith(
          MOCK_RECOVERY_KEY_JWT,
          'newRecoveryKeyId',
          'newRecoveryData',
          true,
          true
        )
      );
    });

    it('renders an error message when the requests are throttled', async () => {
      mockReauthError(AuthUiErrors.THROTTLED);
      renderFlowPage(accountWithKey);
      const createRecoveryKeyButton = screen.getByRole('button', {
        name: 'Create new account recovery key',
      });
      const passwordInput = screen.getByLabelText('Enter your password');
      // input a password to enable form submission
      fireEvent.input(passwordInput, {
        target: { value: 'anypassword' },
      });
      await waitFor(() =>
        expect(createRecoveryKeyButton).not.toHaveAttribute('disabled')
      );
      fireEvent.click(createRecoveryKeyButton);
      await waitFor(() => {
        screen.getByText(/You’ve tried too many times/);
        expect(logViewEvent).toHaveBeenCalledWith(
          `flow.${viewName}`,
          'confirm-password.submit'
        );
        expect(logViewEvent).toHaveBeenCalledWith(
          `flow.${viewName}`,
          'confirm-password.fail'
        );
        expect(navigateForward).not.toHaveBeenCalled();
      });
    });

    it('renders an error message when the password is incorrect', async () => {
      mockReauthError(AuthUiErrors.INCORRECT_PASSWORD);
      renderFlowPage(accountWithKey);
      const createRecoveryKeyButton = screen.getByRole('button', {
        name: 'Create new account recovery key',
      });
      const passwordInput = screen.getByLabelText('Enter your password');
      // input a password to enable form submission
      fireEvent.input(passwordInput, {
        target: { value: 'anypassword' },
      });
      await waitFor(() =>
        expect(createRecoveryKeyButton).not.toHaveAttribute('disabled')
      );
      fireEvent.click(createRecoveryKeyButton);
      await waitFor(() => {
        screen.getByText('Incorrect password');
        expect(logViewEvent).toHaveBeenCalledWith(
          `flow.${viewName}`,
          'confirm-password.submit'
        );
        expect(logViewEvent).toHaveBeenCalledWith(
          `flow.${viewName}`,
          'confirm-password.fail'
        );
        expect(navigateForward).not.toHaveBeenCalled();
      });
    });

    it('renders an error message for unexpected errors', async () => {
      mockReauthError(AuthUiErrors.UNEXPECTED_ERROR);
      renderFlowPage(accountWithKey);
      const createRecoveryKeyButton = screen.getByRole('button', {
        name: 'Create new account recovery key',
      });
      const passwordInput = screen.getByLabelText('Enter your password');
      // input a password to enable form submission
      fireEvent.input(passwordInput, {
        target: { value: 'anypassword' },
      });
      await waitFor(() =>
        expect(createRecoveryKeyButton).not.toHaveAttribute('disabled')
      );
      fireEvent.click(createRecoveryKeyButton);
      await waitFor(() => {
        screen.getByText('Unexpected error');
        expect(logViewEvent).toHaveBeenCalledWith(
          `flow.${viewName}`,
          'confirm-password.submit'
        );
        expect(logViewEvent).toHaveBeenCalledWith(
          `flow.${viewName}`,
          'confirm-password.fail'
        );
        expect(navigateForward).not.toHaveBeenCalled();
      });
    });

    it('emits the expected metrics when user navigates back', () => {
      renderFlowPage(accountWithKey);
      fireEvent.click(screen.getByTestId('flow-container-back-btn'));
      expect(navigateBackward).toHaveBeenCalledTimes(1);
      expect(logViewEvent).toHaveBeenCalledWith(
        `flow.${viewName}`,
        'change-key.cancel'
      );
    });
  });
});
