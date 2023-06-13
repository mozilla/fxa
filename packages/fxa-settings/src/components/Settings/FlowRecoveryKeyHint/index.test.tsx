/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { logViewEvent } from '../../../lib/metrics';
import { Account, AppContext } from '../../../models';
import FlowRecoveryKeyHint, { maxHintLength } from '.';
import { viewName } from '../PageRecoveryKeyCreate';
import {
  renderWithRouter,
  MOCK_ACCOUNT,
  mockAppContext,
} from '../../../models/mocks';
import { AuthUiErrorNos } from '../../../lib/auth-errors/auth-errors';

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
const navigateBackward = jest.fn();
const localizedPageTitle = 'Account Recovery Key';
const localizedBackButtonTitle = 'Back to settings';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

jest.mock('../../../models/AlertBarInfo');

const renderWithContext = (account: Account) => {
  renderWithRouter(
    <AppContext.Provider value={mockAppContext({ account })}>
      <FlowRecoveryKeyHint
        {...{
          localizedBackButtonTitle,
          localizedPageTitle,
          navigateForward,
          navigateBackward,
          viewName,
        }}
      />
    </AppContext.Provider>
  );
};

describe('FlowRecoveryKeyHint', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected', async () => {
    renderWithContext(accountWithSuccess);

    screen.getByRole('heading', { level: 1, name: 'Account Recovery Key' });
    screen.getByRole('progressbar', { name: 'Step 4 of 4.' });
    screen.getByRole('heading', {
      level: 2,
      name: 'Add a hint to help find your key',
    });
    screen.getByText(
      'This hint should help you remember where you stored your account recovery key. We’ll show it to you when you use it to recover your data.'
    );
    screen.getByRole('textbox', { name: 'Enter a hint (optional)' });
    screen.getByRole('button', { name: 'Finish' });
  });

  it('emits the expected metrics when the user lands on this step of the flow', () => {
    renderWithContext(accountWithSuccess);
    expect(logViewEvent).toBeCalledTimes(1);
    expect(logViewEvent).toBeCalledWith(viewName, 'hint-step-view');
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
      expect(logViewEvent).toBeCalledWith(viewName, 'create-hint.submit');
      expect(accountWithSuccess.updateRecoveryKeyHint).toBeCalledWith(
        hintValue
      );
      expect(logViewEvent).toBeCalledWith(viewName, 'create-hint.success');
      expect(navigateForward).toHaveBeenCalledTimes(1);
    });
  });

  it('displays error tooltip if the hint is too long', async () => {
    renderWithContext(accountWithSuccess);
    const hintValueTooLong = 'a'.repeat(maxHintLength + 5);
    const textInput = screen.getByRole('textbox', {
      name: 'Enter a hint (optional)',
    });
    const submitButton = screen.getByText('Finish');
    fireEvent.input(textInput, {
      target: { value: hintValueTooLong },
    });
    await waitFor(() => {
      expect(textInput).toHaveValue(hintValueTooLong);
    });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByTestId('tooltip')).toHaveTextContent(
        'The hint must contain fewer than 255 characters.'
      );
      expect(accountWithSuccess.updateRecoveryKeyHint).not.toBeCalled();
      expect(logViewEvent).not.toBeCalledWith(viewName, 'create-hint.submit');
      expect(navigateForward).not.toBeCalled();
    });
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
      expect(logViewEvent).toBeCalledWith(viewName, 'create-hint.submit');
      expect(accountWithError.updateRecoveryKeyHint).toBeCalledWith(hintValue);
      // logs the error
      expect(logViewEvent).toBeCalledWith(
        viewName,
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
      expect(accountWithSuccess.updateRecoveryKeyHint).not.toBeCalled();
      expect(logViewEvent).toHaveBeenCalledWith(viewName, 'create-hint.skip');
      expect(navigateForward).toHaveBeenCalledTimes(1);
    });
  });

  it('emits the expected metrics when user navigates back', () => {
    renderWithContext(accountWithSuccess);
    fireEvent.click(screen.getByTitle('Back to settings'));
    expect(navigateBackward).toBeCalledTimes(1);
    expect(logViewEvent).toHaveBeenCalledWith(viewName, 'create-hint.skip');
  });
});
