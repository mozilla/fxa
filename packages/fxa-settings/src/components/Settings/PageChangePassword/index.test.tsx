/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import { SETTINGS_PATH } from '../../../constants';
import { mockAppContext, renderWithRouter } from '../../../models/mocks';
import PageChangePassword from '.';
import {
  logViewEvent,
  settingsViewName,
  usePageViewEvent,
} from '../../../lib/metrics';
import { AppContext, Account } from '../../../models';
import {
  inputCurrentPassword,
  inputNewPassword,
  inputVerifyPassword,
} from '../../FormPassword/index.test';

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

const render = async () => {
  renderWithRouter(
    <AppContext.Provider value={mockAppContext({ account })}>
      <PageChangePassword />
    </AppContext.Provider>
  );
};

const changePassword = async () => {
  await render();
  await inputCurrentPassword('quuz');
  await inputNewPassword('testotesto');
  await inputVerifyPassword('testotesto');
  await act(async () => {
    fireEvent.click(screen.getByTestId('save-password-button'));
  });
};

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

it('redirects on success', async () => {
  await changePassword();
  expect(mockNavigate).toHaveBeenCalledWith(SETTINGS_PATH + '#password', {
    replace: true,
  });
});
