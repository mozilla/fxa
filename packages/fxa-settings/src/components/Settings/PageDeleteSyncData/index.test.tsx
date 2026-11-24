/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Account, AppContext } from '../../../models';
import { SettingsContext } from '../../../models/contexts/SettingsContext';
import {
  MOCK_ACCOUNT,
  mockAppContext,
  mockSettingsContext,
  renderWithRouter,
} from '../../../models/mocks';
import GleanMetrics from '../../../lib/glean';
import { PageDeleteSyncData } from '.';
import { MOCK_SYNC_CLIENTS } from '../DataCollection/mocks';
import { mockDeleteSyncDataAuthClient } from '../FlowDeleteSyncDataConfirmPwd/mocks';

const mockNavigateWithQuery = jest.fn();
jest.mock('../../../lib/hooks/useNavigateWithQuery', () => ({
  useNavigateWithQuery: () => mockNavigateWithQuery,
}));
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

const mockSetSigningOut = jest.fn();
const mockClearSignedInAccountUid = jest.fn();
const mockClearTokens = jest.fn();
const mockClearOtpRequests = jest.fn();
jest.mock('../../../lib/cache', () => ({
  ...jest.requireActual('../../../lib/cache'),
  sessionToken: () => 'session-token',
  setSigningOut: (v: boolean) => mockSetSigningOut(v),
  clearSignedInAccountUid: () => mockClearSignedInAccountUid(),
  JwtTokenCache: { clearTokens: (t: string) => mockClearTokens(t) },
  MfaOtpRequestCache: { clear: (t: string) => mockClearOtpRequests(t) },
}));

const mockHandleMfaError = jest.fn().mockReturnValue(false);
jest.mock('../../../lib/hooks/useMfaErrorHandler', () => ({
  useMfaErrorHandler: () => mockHandleMfaError,
}));

const mockFxaLogout = jest.fn();
jest.mock('../../../lib/channels/firefox', () => ({
  __esModule: true,
  default: { fxaLogout: (o: { uid: string }) => mockFxaLogout(o) },
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    deleteSyncData: {
      passwordView: jest.fn(),
      devicesView: jest.fn(),
      success: jest.fn(),
      error: jest.fn(),
    },
    accountPref: { deviceSignout: jest.fn() },
  },
}));

jest.mock('../../../models/AlertBarInfo');

const [currentDevice, phone, workLaptop] = MOCK_SYNC_CLIENTS;

const renderPage = () => {
  const account = {
    ...MOCK_ACCOUNT,
    attachedClients: MOCK_SYNC_CLIENTS,
    deleteSyncData: jest.fn().mockResolvedValue(undefined),
    disconnectClient: jest.fn().mockResolvedValue(undefined),
  } as unknown as Account & {
    deleteSyncData: jest.MockedFunction<Account['deleteSyncData']>;
    disconnectClient: jest.MockedFunction<Account['disconnectClient']>;
  };
  const settingsContext = mockSettingsContext();
  renderWithRouter(
    <AppContext.Provider
      value={mockAppContext({
        account,
        authClient: mockDeleteSyncDataAuthClient(),
      })}
    >
      <SettingsContext.Provider value={settingsContext}>
        <PageDeleteSyncData />
      </SettingsContext.Provider>
    </AppContext.Provider>
  );
  return {
    account,
    alertBar: settingsContext.alertBarInfo!,
    user: userEvent.setup(),
  };
};

const passPasswordStep = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Enter your password'), 'hunter22');
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  await screen.findByRole('heading', { name: 'Delete synced data?' });
};

describe('PageDeleteSyncData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHandleMfaError.mockReturnValue(false);
  });

  it('deletes without signing any devices out', async () => {
    const { account, alertBar, user } = renderPage();
    expect(GleanMetrics.deleteSyncData.passwordView).toHaveBeenCalledTimes(1);
    await passPasswordStep(user);
    expect(GleanMetrics.deleteSyncData.devicesView).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(alertBar.success).toHaveBeenCalledTimes(1));
    expect(account.deleteSyncData).toHaveBeenCalledTimes(1);
    expect(account.disconnectClient).not.toHaveBeenCalled();
    expect(GleanMetrics.deleteSyncData.success).toHaveBeenCalledTimes(1);
    expect(mockNavigateWithQuery).toHaveBeenCalledWith(
      '/settings#data-collection',
      { replace: true }
    );
  });

  it('signs out the chosen devices after deleting', async () => {
    const { account, alertBar, user } = renderPage();
    await passPasswordStep(user);

    await user.click(screen.getByRole('checkbox', { name: 'Work laptop' }));
    await user.click(
      screen.getByRole('button', { name: 'Delete and sign out' })
    );

    await waitFor(() => expect(alertBar.success).toHaveBeenCalledTimes(1));
    expect(account.disconnectClient).toHaveBeenCalledTimes(1);
    expect(account.disconnectClient).toHaveBeenCalledWith(workLaptop);
    expect(GleanMetrics.accountPref.deviceSignout).toHaveBeenCalledWith({
      event: { reason: 'sync_data_deletion' },
    });
    expect(mockSetSigningOut).not.toHaveBeenCalled();
  });

  it('signs no devices out when the delete fails', async () => {
    const { account, alertBar, user } = renderPage();
    account.deleteSyncData.mockRejectedValue({ errno: 203 });
    await passPasswordStep(user);

    await user.click(screen.getByRole('checkbox', { name: 'Work laptop' }));
    await user.click(
      screen.getByRole('button', { name: 'Delete and sign out' })
    );

    await waitFor(() => expect(alertBar.error).toHaveBeenCalledTimes(1));
    expect(alertBar.error).toHaveBeenCalledWith(
      expect.stringContaining('couldn’t delete')
    );
    expect(account.disconnectClient).not.toHaveBeenCalled();
    expect(GleanMetrics.deleteSyncData.error).toHaveBeenCalledWith({
      event: { reason: 'delete_failed' },
    });
    expect(mockNavigateWithQuery).not.toHaveBeenCalled();
    // The user can try again.
    expect(
      screen.getByRole('button', { name: 'Delete and sign out' })
    ).toBeEnabled();
  });

  it('lets the MFA guard handle an expired token instead of alerting', async () => {
    const { account, alertBar, user } = renderPage();
    const expired = { errno: 223 };
    account.deleteSyncData.mockRejectedValue(expired);
    mockHandleMfaError.mockReturnValue(true);
    await passPasswordStep(user);

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(mockHandleMfaError).toHaveBeenCalledWith(expired)
    );
    expect(alertBar.error).not.toHaveBeenCalled();
    expect(GleanMetrics.deleteSyncData.error).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled();
  });

  it('reports a sign-out failure after a successful delete', async () => {
    const { account, alertBar, user } = renderPage();
    account.disconnectClient.mockRejectedValueOnce(new Error('nope'));
    await passPasswordStep(user);

    await user.click(screen.getByRole('checkbox', { name: 'Laurel’s iPhone' }));
    await user.click(screen.getByRole('checkbox', { name: 'Work laptop' }));
    await user.click(
      screen.getByRole('button', { name: 'Delete and sign out' })
    );

    await waitFor(() => expect(alertBar.error).toHaveBeenCalledTimes(1));
    expect(alertBar.error).toHaveBeenCalledWith(
      expect.stringContaining('problem signing you out')
    );
    expect(account.disconnectClient).toHaveBeenCalledTimes(2);
    expect(account.disconnectClient).toHaveBeenCalledWith(phone);
    expect(account.disconnectClient).toHaveBeenCalledWith(workLaptop);
    expect(GleanMetrics.deleteSyncData.success).toHaveBeenCalledTimes(1);
    expect(GleanMetrics.deleteSyncData.error).toHaveBeenCalledWith({
      event: { reason: 'sign_out_failed' },
    });
  });

  it('signs out this device last and leaves Settings', async () => {
    const { account, alertBar, user } = renderPage();
    await passPasswordStep(user);

    await user.click(
      screen.getByRole('checkbox', { name: 'Sign out of Firefox' })
    );
    await user.click(
      screen.getByRole('button', { name: 'Delete and sign out' })
    );

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/', {
        state: { deleteSyncDataSuccess: true },
      })
    );
    expect(mockNavigateWithQuery).not.toHaveBeenCalled();
    expect(account.disconnectClient).toHaveBeenCalledTimes(3);
    expect(account.disconnectClient).toHaveBeenLastCalledWith(currentDevice);
    expect(mockFxaLogout).toHaveBeenCalledWith({ uid: MOCK_ACCOUNT.uid });
    expect(mockClearTokens).toHaveBeenCalledWith('session-token');
    expect(mockClearOtpRequests).toHaveBeenCalledWith('session-token');
    expect(mockSetSigningOut).toHaveBeenCalledWith(true);
    expect(mockClearSignedInAccountUid).toHaveBeenCalledTimes(1);
    expect(alertBar.success).not.toHaveBeenCalled();
  });

  it('reports a failure when signing out this device fails', async () => {
    const { account, alertBar, user } = renderPage();
    account.disconnectClient.mockImplementation(async (client) => {
      if (client === currentDevice) throw new Error('nope');
    });
    await passPasswordStep(user);

    await user.click(
      screen.getByRole('checkbox', { name: 'Sign out of Firefox' })
    );
    await user.click(
      screen.getByRole('button', { name: 'Delete and sign out' })
    );

    await waitFor(() => expect(alertBar.error).toHaveBeenCalledTimes(1));
    expect(alertBar.error).toHaveBeenCalledWith(
      expect.stringContaining('problem signing you out')
    );
    expect(GleanMetrics.deleteSyncData.error).toHaveBeenCalledWith({
      event: { reason: 'sign_out_failed' },
    });
    expect(mockFxaLogout).not.toHaveBeenCalled();
    expect(mockSetSigningOut).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockNavigateWithQuery).toHaveBeenCalledWith(
      '/settings#data-collection',
      { replace: true }
    );
  });

  it('stays signed in on this device when another sign-out fails', async () => {
    const { account, alertBar, user } = renderPage();
    account.disconnectClient.mockRejectedValueOnce(new Error('nope'));
    await passPasswordStep(user);

    await user.click(
      screen.getByRole('checkbox', { name: 'Sign out of Firefox' })
    );
    await user.click(
      screen.getByRole('button', { name: 'Delete and sign out' })
    );

    await waitFor(() => expect(alertBar.error).toHaveBeenCalledTimes(1));
    expect(account.disconnectClient).not.toHaveBeenCalledWith(currentDevice);
    expect(mockFxaLogout).not.toHaveBeenCalled();
    expect(mockSetSigningOut).not.toHaveBeenCalled();
    expect(mockNavigateWithQuery).toHaveBeenCalledWith(
      '/settings#data-collection',
      { replace: true }
    );
  });
});
