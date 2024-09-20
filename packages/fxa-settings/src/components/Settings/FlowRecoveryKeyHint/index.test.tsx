/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { logViewEvent } from '../../../lib/metrics';
import { Account, AppContext } from '../../../models';
import FlowRecoveryKeyHint from '.';
import { viewName } from '../PageRecoveryKeyCreate';
import {
  renderWithRouter,
  MOCK_ACCOUNT,
  mockAppContext,
} from '../../../models/mocks';

const accountWithSuccess = {
  ...MOCK_ACCOUNT,
  updateRecoveryKeyHint: jest.fn().mockResolvedValue(true),
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

    // renders RecoveryKeySetupHint
    screen.getByRole('heading', {
      level: 2,
      name: 'Add a hint to help find your key',
    });
  });

  it('emits the expected metrics when user navigates back', () => {
    renderWithContext(accountWithSuccess);
    fireEvent.click(screen.getByTitle('Back to settings'));
    expect(navigateBackward).toBeCalledTimes(1);
    expect(logViewEvent).toHaveBeenCalledWith(
      `flow.${viewName}`,
      'create-hint.skip'
    );
  });
});
