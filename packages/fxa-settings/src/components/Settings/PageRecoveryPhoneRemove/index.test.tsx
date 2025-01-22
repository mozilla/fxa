/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import PageRecoveryPhoneRemove from '.';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Account, AppContext } from '../../../models';
import {
  mockAppContext,
  mockSettingsContext,
  renderWithRouter,
} from '../../../models/mocks';
import { SettingsContext } from '../../../models/contexts/SettingsContext';
import { useAlertBar } from '../../../models';

jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useAlertBar: jest.fn(),
  useFtlMsgResolver: jest.fn(() => ({
    getMsg: (id: string, fallback: string) => fallback,
  })),
}));

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

const account = {
  removeRecoveryPhone: jest.fn().mockResolvedValue({}),
} as unknown as Account;

describe('PageRecoveryPhoneRemove', () => {
  const alertBar = {
    success: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(() => {
    (useAlertBar as jest.Mock).mockReturnValue(alertBar);
  });

  it('renders as expected', () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <SettingsContext.Provider value={mockSettingsContext()}>
          <PageRecoveryPhoneRemove />
        </SettingsContext.Provider>
      </AppContext.Provider>
    );

    expect(
      screen.getByRole('heading', { name: 'Remove recovery phone number' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'We recommend you keep this method because it’s easier than saving backup authentication codes.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'If you delete it, make sure you still have your saved authentication codes.'
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: /Compare recovery methods/ })
    ).toHaveAttribute(
      'href',
      'https://support.mozilla.org/en-US/kb/secure-firefox-account-two-step-authentication'
    );
  });

  it('submits', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <SettingsContext.Provider value={mockSettingsContext()}>
          <PageRecoveryPhoneRemove />
        </SettingsContext.Provider>
      </AppContext.Provider>
    );

    const user = userEvent.setup();
    await act(async () => {
      await user.click(
        screen.getByRole('button', { name: 'Remove phone number' })
      );
    });

    expect(account.removeRecoveryPhone).toBeCalled();
  });

  it('navigates to settings page on cancel', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <SettingsContext.Provider value={mockSettingsContext()}>
          <PageRecoveryPhoneRemove />
        </SettingsContext.Provider>
      </AppContext.Provider>
    );

    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByRole('link', { name: 'Cancel' }));
    });

    expect(mockNavigate).toHaveBeenCalledWith('/settings#security', {
      replace: true,
    });
  });

  it('shows success alert after removing recovery phone', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <SettingsContext.Provider value={mockSettingsContext()}>
          <PageRecoveryPhoneRemove />
        </SettingsContext.Provider>
      </AppContext.Provider>
    );

    const user = userEvent.setup();
    await act(async () => {
      await user.click(
        screen.getByRole('button', { name: 'Remove phone number' })
      );
    });

    expect(alertBar.success).toHaveBeenCalledWith('Recovery phone removed');
  });

  it('shows error alert when removing recovery phone fails', async () => {
    const error = new Error('Test error');
    (account.removeRecoveryPhone as jest.Mock).mockRejectedValueOnce(error);
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <SettingsContext.Provider value={mockSettingsContext()}>
          <PageRecoveryPhoneRemove />
        </SettingsContext.Provider>
      </AppContext.Provider>
    );

    const user = userEvent.setup();
    await act(async () => {
      await user.click(
        screen.getByRole('button', { name: 'Remove phone number' })
      );
    });

    expect(alertBar.error).toHaveBeenCalledWith('Unexpected error');
  });
});
