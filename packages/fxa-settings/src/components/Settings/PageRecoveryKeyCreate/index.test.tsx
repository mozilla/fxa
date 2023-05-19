/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
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

const accountWithoutKey = {
  ...MOCK_ACCOUNT,
  recoveryKey: false,
  createRecoveryKey: jest.fn().mockResolvedValue(new Uint8Array(20)),
} as unknown as Account;

const accountWithKey = {
  ...MOCK_ACCOUNT,
  recoveryKey: true,
  createRecoveryKey: jest.fn().mockResolvedValue(new Uint8Array(20)),
  deleteRecoveryKey: jest.fn().mockResolvedValue(true),
} as unknown as Account;

const renderPageWithContext = (account: Account) => {
  renderWithRouter(
    <AppContext.Provider value={mockAppContext({ account })}>
      <PageRecoveryKeyCreate />
    </AppContext.Provider>
  );
};

describe('PageRecoveryKeyCreate when recovery key not enabled', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('renders initial flow page as expected', () => {
    renderPageWithContext(accountWithoutKey);

    screen.getByText(
      'Create an account recovery key in case you forget your password'
    );
  });

  it('shifts views when the user clicks through the flow steps', async () => {
    renderPageWithContext(accountWithoutKey);

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
        level: 2,
        name: 'Great! Now add a storage hint',
      })
    );
  });

  it('emits expected page view metrics on load', async () => {
    renderPageWithContext(accountWithoutKey);
    await waitFor(() => {
      expect(usePageViewEvent).toHaveBeenCalledWith(
        'settings.account-recovery'
      );
    });
  });
});

describe('PageRecoveryKeyCreate when recovery key is enabled', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('renders initial flow page as expected', () => {
    renderPageWithContext(accountWithKey);

    screen.getByRole('heading', {
      level: 2,
      name: 'Change your account recovery key',
    });
    screen.getByRole('button', { name: 'Change account recovery key' });
    screen.getByRole('link', { name: 'Cancel' });
  });

  it('shifts views when the user clicks through the flow steps', async () => {
    renderPageWithContext(accountWithKey);

    // Go to page 2
    const flowPage1Button = screen.getByRole('button', {
      name: 'Change account recovery key',
    });
    fireEvent.click(flowPage1Button);
    await waitFor(() => {
      screen.getByRole('heading', {
        name: 'Enter your password again to get started',
      });
      screen.getByRole('link', { name: 'Cancel' });
    });

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
        level: 2,
        name: 'Great! Now add a storage hint',
      })
    );
  });

  it('emits expected page view metrics on load', async () => {
    renderPageWithContext(accountWithKey);
    await waitFor(() => {
      expect(usePageViewEvent).toHaveBeenCalledWith(
        'settings.account-recovery'
      );
    });
  });
});