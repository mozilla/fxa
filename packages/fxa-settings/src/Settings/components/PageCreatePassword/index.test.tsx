/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import {
  logViewEvent,
  settingsViewName,
  usePageViewEvent,
} from '../../../lib/metrics';
import { PageCreatePassword } from '.';
import { Account, AlertBarInfo, AppContext } from '../../../models';
import { mockAppContext, renderWithRouter } from '../../../models/mocks';
import {
  inputNewPassword,
  inputVerifyPassword,
} from '../FormPassword/index.test';
import { act, fireEvent, screen } from '@testing-library/react';
import { HomePath } from '../../../constants';

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
    createdAt: 0,
  },
  createPassword: jest.fn().mockResolvedValue(true),
} as unknown as Account;

const accountWithCreateErr = {
  ...account,
  createPassword: jest.fn().mockImplementation(() => {
    throw new Error('whoops');
  }),
} as unknown as Account;

const render = async (shouldError = false) => {
  const alertBarInfo = {
    success: jest.fn(),
    error: jest.fn(),
  } as unknown as AlertBarInfo;

  renderWithRouter(
    <AppContext.Provider
      value={mockAppContext({
        account: shouldError ? accountWithCreateErr : account,
        alertBarInfo,
      })}
    >
      <PageCreatePassword />
    </AppContext.Provider>
  );
  return alertBarInfo;
};

const createPassword = async (shouldError = false) => {
  const alertBarInfo = await render(shouldError);
  await inputNewPassword('testotesto');
  await inputVerifyPassword('testotesto');
  await act(async () => {
    fireEvent.click(screen.getByTestId('save-password-button'));
  });
  return alertBarInfo;
};

describe('PageCreatePassword', () => {
  beforeEach(() => {
    const mockNavigate = jest.fn();
    jest.mock('@reach/router', () => ({
      ...jest.requireActual('@reach/router'),
      useNavigate: () => mockNavigate,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders', async () => {
    await render();
    expect(screen.getByTestId('flow-container')).toBeInTheDocument();
    screen.getByLabelText('Enter new password');
    const currentPw = screen.queryByLabelText('Enter current password');
    expect(currentPw).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('nav-link-reset-password')
    ).not.toBeInTheDocument();
  });

  it('emits a metrics event on render', async () => {
    await render();
    expect(usePageViewEvent).toHaveBeenCalledWith('settings.create-password');
  });

  it('emits metrics events on success', async () => {
    await createPassword();
    expect(logViewEvent).toHaveBeenCalledWith(
      settingsViewName,
      'create-password.engage'
    );
    expect(logViewEvent).toHaveBeenCalledWith(
      settingsViewName,
      'create-password.submit'
    );
    expect(logViewEvent).toHaveBeenCalledWith(
      settingsViewName,
      'create-password.success'
    );
  });

  it('emits metrics events on failure', async () => {
    await createPassword(true);
    expect(logViewEvent).toHaveBeenCalledWith(
      settingsViewName,
      'create-password.engage'
    );
    expect(logViewEvent).toHaveBeenCalledWith(
      settingsViewName,
      'create-password.submit'
    );
    expect(logViewEvent).toHaveBeenCalledWith(
      settingsViewName,
      'create-password.fail'
    );
  });

  it('displays alert bar error on fail without redirecting', async () => {
    const alertBarInfo = await createPassword(true);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(alertBarInfo.error).toHaveBeenCalledTimes(1);
    expect(alertBarInfo.error).toHaveBeenCalledWith(
      'Sorry, there was a problem setting your password'
    );
  });

  it('redirects and displays alert bar on success', async () => {
    const alertBarInfo = await createPassword();
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(HomePath + '#password', {
      replace: true,
    });
    expect(alertBarInfo.success).toHaveBeenCalledTimes(1);
    expect(alertBarInfo.success).toHaveBeenCalledWith('Password set');
  });
});
