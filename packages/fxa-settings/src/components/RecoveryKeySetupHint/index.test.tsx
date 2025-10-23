/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecoveryKeySetupHint, { MAX_HINT_LENGTH } from '.';
import { AuthUiErrorNos } from '../../lib/auth-errors/auth-errors';
import { logViewEvent } from '../../lib/metrics';
import { Account } from '../../models';
import { MOCK_ACCOUNT, renderWithRouter } from '../../models/mocks';
import { viewName } from '../Settings/PageRecoveryKeyCreate';

const gqlUnexpectedError: any = AuthUiErrorNos[999];

const accountWithSuccess = {
  ...MOCK_ACCOUNT,
  updateRecoveryKeyHint: jest.fn().mockResolvedValue(true),
} as unknown as Account;

const accountWithError = {
  ...MOCK_ACCOUNT,
  updateRecoveryKeyHint: jest.fn().mockRejectedValue(gqlUnexpectedError),
} as unknown as Account;

const navigateForward = jest.fn();

jest.mock('../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

jest.mock('../../models/AlertBarInfo');

const renderWithContext = (account: Account) => {
  renderWithRouter(
    <RecoveryKeySetupHint
      {...{
        updateRecoveryKeyHint: account.updateRecoveryKeyHint,
        navigateForward,
        viewName,
      }}
    />
  );
};

describe('RecoveryKeySetupHint', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected', async () => {
    renderWithContext(accountWithSuccess);

    screen.getByRole('heading', {
      level: 2,
      name: 'Add a hint to help find your key',
    });
    screen.getByText(
      'This hint should help you remember where you stored your account recovery key. We can show it to you during the password reset to recover your data.'
    );
    screen.getByRole('textbox', { name: 'Enter a hint (optional)' });
    screen.getByRole('button', { name: 'Finish' });
  });

  it('emits the expected metrics when the user lands on this step of the flow', () => {
    renderWithContext(accountWithSuccess);
    expect(logViewEvent).toHaveBeenCalledTimes(1);
    expect(logViewEvent).toHaveBeenCalledWith(
      `flow.${viewName}`,
      'create-hint.view'
    );
  });

  it('saves the hint on submit if the user has entered a valid hint in the text input', async () => {
    renderWithContext(accountWithSuccess);
    const hintValue = 'Ye Olde Hint';
    const textInput = screen.getByRole('textbox', {
      name: 'Enter a hint (optional)',
    });
    const submitButton = screen.getByText('Finish');
    fireEvent.input(textInput, {
      target: { value: hintValue },
    });
    await waitFor(() => {
      expect(textInput).toHaveValue(hintValue);
    });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(logViewEvent).toHaveBeenCalledWith(
        `flow.${viewName}`,
        'create-hint.submit'
      );
      expect(accountWithSuccess.updateRecoveryKeyHint).toHaveBeenCalledWith(
        hintValue
      );
      expect(logViewEvent).toHaveBeenCalledWith(
        `flow.${viewName}`,
        'create-hint.success'
      );
      expect(navigateForward).toHaveBeenCalledTimes(1);
    });
  });

  it('limits the input to a max length', async () => {
    const user = userEvent.setup();
    renderWithContext(accountWithSuccess);
    const hintValueTooLong = 'a'.repeat(MAX_HINT_LENGTH + 5);
    const textInput = screen.getByRole('textbox', {
      name: 'Enter a hint (optional)',
    });
    await user.type(textInput, hintValueTooLong);
    expect(textInput).toHaveValue('a'.repeat(MAX_HINT_LENGTH));
  });

  it('logs an error if saving a valid hint failed', async () => {
    renderWithContext(accountWithError);
    const hintValue = 'Ye Olde Hint';
    const textInput = screen.getByRole('textbox', {
      name: 'Enter a hint (optional)',
    });
    const submitButton = screen.getByText('Finish');
    fireEvent.input(textInput, {
      target: { value: hintValue },
    });
    await waitFor(() => {
      expect(textInput).toHaveValue(hintValue);
    });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(logViewEvent).toHaveBeenCalledWith(
        `flow.${viewName}`,
        'create-hint.submit'
      );
      expect(accountWithError.updateRecoveryKeyHint).toHaveBeenCalledWith(
        hintValue
      );
      // logs the error
      expect(logViewEvent).toHaveBeenCalledWith(
        `flow.${viewName}`,
        'create-hint.fail',
        gqlUnexpectedError
      );
      expect(navigateForward).not.toHaveBeenCalled();
      // displays an error banner
      screen.getByText('Unexpected error');
    });
  });

  it('navigates the user forward on submit without saving a hint, if the user has not entered one', async () => {
    renderWithContext(accountWithSuccess);
    const submitButton = screen.getByText('Finish');
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(accountWithSuccess.updateRecoveryKeyHint).not.toHaveBeenCalled();
      expect(logViewEvent).toHaveBeenCalledWith(
        `flow.${viewName}`,
        'create-hint.skip'
      );
      expect(navigateForward).toHaveBeenCalledTimes(1);
    });
  });
});
