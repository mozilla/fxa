/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { SETTINGS_PATH } from '../../../constants';
import {
  mockAppContext,
  mockSettingsContext,
  renderWithRouter,
} from '../../../models/mocks';

import PageChangePassword from '.';
import {
  logViewEvent,
  settingsViewName,
  usePageViewEvent,
} from '../../../lib/metrics';
import { AppContext, Account } from '../../../models';
import { SettingsContext } from '../../../models/contexts/SettingsContext';
import {
  inputCurrentPassword,
  inputNewPassword,
  inputVerifyPassword,
} from '../../FormPassword/index.test';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

jest.mock('../../../models/AlertBarInfo');
jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
  settingsViewName: 'quuz',
}));
const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

const account = {
  primaryEmail: {
    email: 'test@example.com',
  },
  changePassword: jest.fn().mockResolvedValue(true),
} as unknown as Account;

const settingsContext = mockSettingsContext();

const render = async (mockAccount = account) => {
  renderWithRouter(
    <AppContext.Provider value={mockAppContext({ account: mockAccount })}>
      <SettingsContext.Provider value={settingsContext}>
        <PageChangePassword />
      </SettingsContext.Provider>
    </AppContext.Provider>
  );
};

const changePassword = async () => {
  await inputCurrentPassword('quuz');
  await inputNewPassword('testotesto');
  await inputVerifyPassword('testotesto');
  await act(async () => {
    fireEvent.click(screen.getByTestId('save-password-button'));
  });
};

describe('PageChangePassword', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders', async () => {
    await render();
    expect(screen.getByTestId('flow-container')).toBeInTheDocument();
    screen.getByLabelText('Enter current password');
    expect(screen.getByTestId('nav-link-reset-password')).toBeInTheDocument();
  });

  it('emits a metrics event on render', async () => {
    await render();
    expect(usePageViewEvent).toHaveBeenCalledWith('settings.change-password');
  });

  it('emits a metrics event on success', async () => {
    await render();
    await changePassword();
    expect(logViewEvent).toHaveBeenCalledWith(
      settingsViewName,
      'change-password.success'
    );
  });

  it('shows an error when old and new password are the same', async () => {
    await render();
    await inputCurrentPassword('testotesto');
    await inputNewPassword('testotesto');
    await inputVerifyPassword('testotesto');
    await act(async () => {
      fireEvent.click(screen.getByTestId('save-password-button'));
    });

    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toHaveTextContent(
      'new password must be different'
    );
  });

  it('shows an incorrect password error message in tooltip', async () => {
    const mockAccount = {
      primaryEmail: {
        email: 'test@example.com',
      },
      changePassword: jest
        .fn()
        .mockRejectedValue(AuthUiErrors.INCORRECT_PASSWORD),
    } as unknown as Account;
    await render(mockAccount);
    await changePassword();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toHaveTextContent(
      'Incorrect password'
    );
  });

  it('shows an unexpected error message in alertBar when error is unknown', async () => {
    const mockAccount = {
      primaryEmail: {
        email: 'test@example.com',
      },
      changePassword: jest.fn().mockRejectedValue({ error: 'bloop' }),
    } as unknown as Account;
    await render(mockAccount);
    await changePassword();
    await waitFor(() =>
      expect(settingsContext.alertBarInfo?.error).toBeCalledTimes(1)
    );
    expect(settingsContext.alertBarInfo?.error).toHaveBeenCalledWith(
      'Unexpected error'
    );
  });

  it('redirects on success', async () => {
    await render();
    await changePassword();
    await waitFor(() =>
      expect(settingsContext.alertBarInfo?.success).toBeCalledTimes(1)
    );
    expect(mockNavigate).toHaveBeenCalledWith(SETTINGS_PATH + '#password', {
      replace: true,
    });
  });
});
