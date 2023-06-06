/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { logViewEvent } from '../../../lib/metrics';
import FlowRecoveryKeyConfirmPwd from './';
import {
  mockAppContext,
  MOCK_ACCOUNT,
  renderWithRouter,
} from '../../../models/mocks';
import { Account, AppContext } from '../../../models';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { RecoveryKeyAction } from '../PageRecoveryKeyCreate';

const localizedBackButtonTitle = 'Back to settings';
const localizedPageTitle = 'Account Recovery Key';
const navigateForward = jest.fn();
const navigateBackward = jest.fn();
const viewName = 'settings.account-recovery';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

jest.mock('base32-encode', () =>
  jest.fn().mockReturnValue('00000000000000000000000000000000')
);

const setFormattedRecoveryKey = jest.fn();

const accountWithSuccess = {
  ...MOCK_ACCOUNT,
  createRecoveryKey: jest.fn().mockResolvedValue(new Uint8Array(20)),
  deleteRecoveryKey: jest.fn().mockResolvedValue(true),
} as unknown as Account;

const accountWithPasswordError = {
  ...MOCK_ACCOUNT,
  createRecoveryKey: () => {
    throw AuthUiErrors.INCORRECT_PASSWORD;
  },
  deleteRecoveryKey: jest.fn().mockResolvedValue(true),
} as unknown as Account;

const accountWithThrottledError = {
  ...MOCK_ACCOUNT,
  createRecoveryKey: () => {
    throw AuthUiErrors.THROTTLED;
  },
  deleteRecoveryKey: jest.fn().mockResolvedValue(true),
} as unknown as Account;

const accountWithUnexpectedError = {
  ...MOCK_ACCOUNT,
  createRecoveryKey: () => {
    throw AuthUiErrors.UNEXPECTED_ERROR;
  },
  deleteRecoveryKey: jest.fn().mockResolvedValue(true),
} as unknown as Account;

const renderFlowPage = (account: Account, action: RecoveryKeyAction) => {
  window.URL.createObjectURL = jest.fn();
  renderWithRouter(
    <AppContext.Provider value={mockAppContext({ account })}>
      <FlowRecoveryKeyConfirmPwd
        {...{
          action,
          localizedBackButtonTitle,
          localizedPageTitle,
          navigateForward,
          navigateBackward,
          setFormattedRecoveryKey,
          viewName,
        }}
      />
    </AppContext.Provider>
  );
};

describe('FlowRecoveryKeyConfirmPwd with Create Action', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected', async () => {
    renderFlowPage(accountWithSuccess, RecoveryKeyAction.Create);

    screen.getByRole('heading', {
      name: 'Re-enter your password for security',
    });
    screen.getByLabelText('Enter your password');
    screen.getByRole('button', { name: 'Create account recovery key' });
  });

  it('disables the submit button when the input is empty', async () => {
    renderFlowPage(accountWithSuccess, RecoveryKeyAction.Create);
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
    renderFlowPage(accountWithSuccess, RecoveryKeyAction.Create);
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
      expect(logViewEvent).toBeCalledWith(
        `flow.${viewName}`,
        'confirm-password.submit'
      );
      expect(logViewEvent).toBeCalledWith(
        `flow.${viewName}`,
        'confirm-password.success'
      );
      expect(navigateForward).toBeCalledTimes(1);
    });
  });

  it('renders an error message when the requests are throttled', async () => {
    renderFlowPage(accountWithThrottledError, RecoveryKeyAction.Create);
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
      expect(logViewEvent).toBeCalledWith(
        `flow.${viewName}`,
        'confirm-password.submit'
      );
      expect(logViewEvent).toBeCalledWith(
        `flow.${viewName}`,
        'confirm-password.fail'
      );
      expect(navigateForward).not.toBeCalled();
    });
  });

  it('renders an error message when the password is incorrect', async () => {
    renderFlowPage(accountWithPasswordError, RecoveryKeyAction.Create);
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
      expect(logViewEvent).toBeCalledWith(
        `flow.${viewName}`,
        'confirm-password.submit'
      );
      expect(logViewEvent).toBeCalledWith(
        `flow.${viewName}`,
        'confirm-password.fail'
      );
      expect(navigateForward).not.toBeCalled();
    });
  });

  it('renders an error message for unexpected errors', async () => {
    renderFlowPage(accountWithUnexpectedError, RecoveryKeyAction.Create);
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
      expect(logViewEvent).toBeCalledWith(
        `flow.${viewName}`,
        'confirm-password.submit'
      );
      expect(logViewEvent).toBeCalledWith(
        `flow.${viewName}`,
        'confirm-password.fail'
      );
      expect(navigateForward).not.toBeCalled();
    });
  });

  it('emits the expected metrics when user navigates back', () => {
    renderFlowPage(accountWithSuccess, RecoveryKeyAction.Create);
    fireEvent.click(screen.getByTestId('flow-container-back-btn'));
    expect(navigateBackward).toBeCalledTimes(1);
    expect(logViewEvent).toBeCalledWith(
      `flow.${viewName}`,
      'create-key.cancel'
    );
  });
});

describe('FlowRecoveryKeyConfirmPwd with Change Action', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected', async () => {
    renderFlowPage(accountWithSuccess, RecoveryKeyAction.Change);

    screen.getByRole('heading', {
      name: 'Re-enter your password for security',
    });
    screen.getByLabelText('Enter your password');
    screen.getByRole('button', { name: 'Create new account recovery key' });
    screen.getByRole('link', { name: 'Cancel' });
  });

  it('disables the submit button when the input is empty', async () => {
    renderFlowPage(accountWithSuccess, RecoveryKeyAction.Change);
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
    renderFlowPage(accountWithSuccess, RecoveryKeyAction.Change);
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
      expect(logViewEvent).toBeCalledWith(
        `flow.${viewName}`,
        'confirm-password.submit'
      );
      expect(logViewEvent).toBeCalledWith(
        `flow.${viewName}`,
        'confirm-password.success'
      );
      expect(navigateForward).toBeCalledTimes(1);
    });
  });

  it('renders an error message when the requests are throttled', async () => {
    renderFlowPage(accountWithThrottledError, RecoveryKeyAction.Change);
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
      expect(logViewEvent).toBeCalledWith(
        `flow.${viewName}`,
        'confirm-password.submit'
      );
      expect(logViewEvent).toBeCalledWith(
        `flow.${viewName}`,
        'confirm-password.fail'
      );
      expect(navigateForward).not.toBeCalled();
    });
  });

  it('renders an error message when the password is incorrect', async () => {
    renderFlowPage(accountWithPasswordError, RecoveryKeyAction.Change);
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
      expect(logViewEvent).toBeCalledWith(
        `flow.${viewName}`,
        'confirm-password.submit'
      );
      expect(logViewEvent).toBeCalledWith(
        `flow.${viewName}`,
        'confirm-password.fail'
      );
      expect(navigateForward).not.toBeCalled();
    });
  });

  it('renders an error message for unexpected errors', async () => {
    renderFlowPage(accountWithUnexpectedError, RecoveryKeyAction.Change);
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
      expect(logViewEvent).toBeCalledWith(
        `flow.${viewName}`,
        'confirm-password.submit'
      );
      expect(logViewEvent).toBeCalledWith(
        `flow.${viewName}`,
        'confirm-password.fail'
      );
      expect(navigateForward).not.toBeCalled();
    });
  });

  it('emits the expected metrics when user navigates back', () => {
    renderFlowPage(accountWithSuccess, RecoveryKeyAction.Change);
    fireEvent.click(screen.getByTestId('flow-container-back-btn'));
    expect(navigateBackward).toBeCalledTimes(1);
    expect(logViewEvent).toBeCalledWith(
      `flow.${viewName}`,
      'change-key.cancel'
    );
  });
});
