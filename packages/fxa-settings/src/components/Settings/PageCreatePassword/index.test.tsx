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
import {
  mockAppContext,
  mockSettingsContext,
  renderWithRouter,
} from '../../../models/mocks';
import {
  inputNewPassword,
  inputVerifyPassword,
} from '../../FormPassword/index.test';
import { act, fireEvent, screen } from '@testing-library/react';
import { SETTINGS_PATH } from '../../../constants';
import { SettingsContext } from '../../../models/contexts/SettingsContext';
import { LinkedAccountProviderIds } from '../../../lib/types';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
  settingsViewName: 'quuz',
}));
const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation(),
}));

let mockLocationState = {};
const mockLocation = () => {
  return {
    state: mockLocationState,
  };
};

const account = {
  primaryEmail: {
    email: 'test@example.com',
    createdAt: 0,
  },
  hasPassword: false,
  createPassword: jest.fn().mockResolvedValue(true),
} as unknown as Account;

const accountWithPassword = {
  ...account,
  hasPassword: true,
} as unknown as Account;

const accountThatGainsPassword = {
  ...account,
  createPassword: jest.fn().mockImplementation(function (this: any) {
    // Simulate the account gaining a password after createPassword is called
    this.hasPassword = true;
    return Promise.resolve(true);
  }),
} as unknown as Account;

const accountWithCreateErr = {
  ...account,
  createPassword: jest.fn().mockImplementation(() => {
    throw new Error('whoops');
  }),
} as unknown as Account;

const render = async (accountOverride?: Account) => {
  const alertBarInfo = {
    success: jest.fn(),
    error: jest.fn(),
  } as unknown as AlertBarInfo;
  const settingsContext = mockSettingsContext({ alertBarInfo });
  renderWithRouter(
    <AppContext.Provider
      value={mockAppContext({
        account: accountOverride || account,
      })}
    >
      <SettingsContext.Provider value={settingsContext}>
        <PageCreatePassword />
      </SettingsContext.Provider>
    </AppContext.Provider>
  );
  return alertBarInfo;
};

const createPassword = async (accountOverride?: Account) => {
  const alertBarInfo = await render(accountOverride);
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

  it('redirects to /change_password when account already has a password', async () => {
    await render(accountWithPassword);
    expect(mockNavigate).toHaveBeenCalledWith(
      SETTINGS_PATH + '/change_password',
      {
        replace: true,
      }
    );
  });

  it('redirects to settings and not /change_password if password is successfully created', async () => {
    const alertBarInfo = await createPassword(accountThatGainsPassword);
    // Should only navigate once - to settings after success, not to change_password
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalledWith(
      SETTINGS_PATH + '/change_password',
      expect.anything()
    );
    expect(mockNavigate).toHaveBeenCalledWith(SETTINGS_PATH + '#password', {
      replace: true,
      state: {
        wantsUnlinkProviderId: undefined,
      },
    });
    expect(alertBarInfo.success).toHaveBeenCalledWith('Password set');
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
    await createPassword(accountWithCreateErr);
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
    const alertBarInfo = await createPassword(accountWithCreateErr);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(alertBarInfo.error).toHaveBeenCalledTimes(1);
    expect(alertBarInfo.error).toHaveBeenCalledWith(
      'Sorry, there was a problem setting your password'
    );
  });

  it('redirects and displays alert bar on success', async () => {
    const alertBarInfo = await createPassword();
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(SETTINGS_PATH + '#password', {
      replace: true,
      state: {
        wantsUnlinkProviderId: undefined,
      },
    });
    expect(alertBarInfo.success).toHaveBeenCalledTimes(1);
    expect(alertBarInfo.success).toHaveBeenCalledWith('Password set');
  });

  describe('location state', () => {
    afterEach(() => {
      mockLocationState = {};
    });
    it('redirects with linked account state if present', async () => {
      mockLocationState = {
        wantsUnlinkProviderId: LinkedAccountProviderIds.Google,
      };
      await createPassword();
      expect(mockNavigate).toHaveBeenCalledWith(
        SETTINGS_PATH + '#linked-account',
        {
          replace: true,
          state: {
            wantsUnlinkProviderId: LinkedAccountProviderIds.Google,
          },
        }
      );
    });
  });
});
