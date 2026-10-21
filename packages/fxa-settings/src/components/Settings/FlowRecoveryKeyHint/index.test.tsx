/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthClient from 'fxa-auth-client/browser';
import { logViewEvent } from '../../../lib/metrics';
import { Account, AppContext } from '../../../models';
import FlowRecoveryKeyHint from '.';
import { viewName } from '../PageRecoveryKeyCreate';
import {
  renderWithRouter,
  MOCK_ACCOUNT,
  mockAppContext,
} from '../../../models/mocks';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

const MOCK_SESSION_TOKEN = 'sessionToken';
jest.mock('../../../lib/cache', () => ({
  ...jest.requireActual('../../../lib/cache'),
  sessionToken: () => 'sessionToken',
}));

const mockAuthClient = { updateRecoveryKeyHint: jest.fn() };

const navigateForward = jest.fn();
const navigateBackward = jest.fn();
const localizedPageTitle = 'Account Recovery Key';
const localizedBackButtonTitle = 'Back to settings';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

jest.mock('../../../models/AlertBarInfo');

const renderWithContext = () => {
  renderWithRouter(
    <AppContext.Provider
      value={mockAppContext({
        account: MOCK_ACCOUNT as unknown as Account,
        authClient: mockAuthClient as unknown as AuthClient,
      })}
    >
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
    renderWithContext();

    screen.getByRole('heading', { level: 1, name: 'Account Recovery Key' });
    screen.getByRole('progressbar', { name: 'Step 4 of 4.' });

    // renders RecoveryKeySetupHint
    screen.getByRole('heading', {
      level: 2,
      name: 'Add a hint to help find your key',
    });
  });

  it('saves the hint with the session token', async () => {
    mockAuthClient.updateRecoveryKeyHint.mockResolvedValue({});
    renderWithContext();
    const user = userEvent.setup();
    await user.type(
      screen.getByRole('textbox', { name: 'Enter a hint (optional)' }),
      'area 51'
    );
    await user.click(screen.getByRole('button', { name: 'Finish' }));

    await waitFor(() => expect(navigateForward).toHaveBeenCalledTimes(1));
    expect(mockAuthClient.updateRecoveryKeyHint).toHaveBeenCalledWith(
      MOCK_SESSION_TOKEN,
      'area 51'
    );
  });

  it('stays on the page when saving the hint fails', async () => {
    mockAuthClient.updateRecoveryKeyHint.mockRejectedValue(
      AuthUiErrors.UNEXPECTED_ERROR
    );
    renderWithContext();
    const user = userEvent.setup();
    await user.type(
      screen.getByRole('textbox', { name: 'Enter a hint (optional)' }),
      'area 51'
    );
    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(
      await screen.findByText(AuthUiErrors.UNEXPECTED_ERROR.message)
    ).toBeInTheDocument();
    expect(navigateForward).not.toHaveBeenCalled();
  });

  it('emits the expected metrics when user navigates back', () => {
    renderWithContext();
    fireEvent.click(screen.getByTitle('Back to settings'));
    expect(navigateBackward).toHaveBeenCalledTimes(1);
    expect(logViewEvent).toHaveBeenCalledWith(
      `flow.${viewName}`,
      'create-hint.skip'
    );
  });
});
