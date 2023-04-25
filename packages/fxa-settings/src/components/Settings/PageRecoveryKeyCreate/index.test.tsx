/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { usePageViewEvent } from '../../../lib/metrics';
import PageRecoveryKeyCreate from '.';
import {
  mockAppContext,
  MOCK_ACCOUNT,
  renderWithRouter,
} from '../../../models/mocks';
import { Account, AppContext } from '../../../models';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

jest.mock('base32-encode', () =>
  jest.fn().mockReturnValue('00000000000000000000000000000000')
);

window.URL.createObjectURL = jest.fn();

const accountWithSuccess = {
  ...MOCK_ACCOUNT,
  createRecoveryKey: jest.fn().mockResolvedValue(new Uint8Array(20)),
} as unknown as Account;

const renderPageWithContext = (account: Account) => {
  renderWithRouter(
    <AppContext.Provider value={mockAppContext({ account })}>
      <PageRecoveryKeyCreate />
    </AppContext.Provider>
  );
};

describe('PageRecoveryKeyCreate', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('renders initial flow page as expected', () => {
    renderPageWithContext(accountWithSuccess);

    screen.getByText(
      'Create an account recovery key in case you forget your password'
    );
  });
  it('shifts views when the user clicks through the flow steps', async () => {
    renderPageWithContext(accountWithSuccess);

    // Go to page 2
    const flowPage1Button = screen.getByRole('button', {
      name: 'Start creating your account recovery key',
    });
    fireEvent.click(flowPage1Button);
    await waitFor(() =>
      screen.getByRole('heading', {
        name: 'Enter your password again to get started',
      })
    );

    // Go to page 3
    const flowPage2Button = screen.getByRole('button', {
      name: 'Create account recovery key',
    });
    // input a password to enable form submission
    fireEvent.input(screen.getByLabelText('Enter your password'), {
      target: { value: 'anypassword' },
    });
    await waitFor(() => {
      expect(flowPage2Button).not.toHaveAttribute('disabled');
    });
    fireEvent.click(flowPage2Button);
    await waitFor(() => {
      screen.getByRole('heading', {
        name: 'Account recovery key generated — store it in a place you’ll remember',
      });
    });

    // Go to page 4
    const flowPage3Button = screen.getByText(
      'Download your account recovery key'
    );
    fireEvent.click(flowPage3Button);
    await waitFor(() =>
      screen.getByRole('heading', {
        name: 'Fourth step',
      })
    );
  });

  it('emits expected page view metrics on load', async () => {
    render(<PageRecoveryKeyCreate />);
    await waitFor(() => {
      expect(usePageViewEvent).toHaveBeenCalledWith(
        'settings.account-recovery'
      );
    });
  });
});
