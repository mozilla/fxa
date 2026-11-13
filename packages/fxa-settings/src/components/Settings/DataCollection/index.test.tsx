/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { DataCollection } from '.';
import {
  mockAppContext,
  mockSettingsContext,
  renderWithRouter,
} from '../../../models/mocks';
import { Account, AppContext } from '../../../models';
import { SettingsContext } from '../../../models/contexts/SettingsContext';
import { getDefault } from '../../../lib/config';
import { MOCK_SYNC_CLIENTS } from './mocks';

const account = {
  displayName: 'jrgm',
  metricsOpt: jest.fn().mockResolvedValue(true),
  metricsEnabled: true,
} as unknown as Account;

jest.mock('../../../models/AlertBarInfo');

describe('DataCollection', () => {
  it('renders as expected', () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <SettingsContext.Provider value={mockSettingsContext()}>
          <DataCollection />
        </SettingsContext.Provider>
      </AppContext.Provider>
    );

    screen.getByRole('heading', { level: 2, name: 'Data Collection and Use' });
    screen.getByRole('heading', { level: 3, name: 'Mozilla accounts' });
    screen.getByRole('heading', { level: 3, name: 'Firefox browser' });
    screen.getByText(
      'Allow Mozilla accounts to send technical and interaction data to Mozilla.'
    );
    screen.getByText(
      'To review or update your Firefox browser technical and interaction data settings, open Firefox settings and navigate to Privacy and Security.'
    );
    expect(
      screen.getByTestId('link-external-telemetry-opt-out')
    ).toHaveAttribute(
      'href',
      'https://www.mozilla.org/privacy/mozilla-accounts/'
    );
    expect(
      screen.getByTestId('link-external-firefox-telemetry')
    ).toHaveAttribute(
      'href',
      'https://support.mozilla.org/kb/manage-firefox-data-collection-privacy-settings'
    );
  });

  it('toggles', async () => {
    const it = renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <SettingsContext.Provider value={mockSettingsContext()}>
          <DataCollection />
        </SettingsContext.Provider>
      </AppContext.Provider>
    );

    const button = it.getByTestId('metrics-opt-out');
    // since metricsOpt is async and uses useState the `act` here is necessary
    await act(async () => {
      button.click();
    });
    await waitFor(() => expect(account.metricsOpt).toHaveBeenCalledWith('out'));
    //@ts-ignore mock doesn't care that the prop is readonly
    account.metricsEnabled = false;
    await act(async () => {
      button.click();
    });
    await waitFor(() => expect(account.metricsOpt).toHaveBeenCalledWith('in'));
  });

  describe('AlertBar', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('displays an opt out success message in the AlertBar', async () => {
      const settingsContext = mockSettingsContext();
      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <SettingsContext.Provider value={settingsContext}>
            <DataCollection />
          </SettingsContext.Provider>
        </AppContext.Provider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('metrics-opt-out'));
      });

      expect(settingsContext.alertBarInfo?.success).toHaveBeenCalledTimes(1);
      expect(
        (settingsContext.alertBarInfo?.success as jest.Mock).mock.calls[0][0]
      ).toContain('Opt out successful.');
    });

    it('displays an opt in success message in the AlertBar', async () => {
      const context = mockAppContext({
        account: {
          ...account,
          metricsEnabled: true,
        } as Account,
      });
      const settingsContext = mockSettingsContext();
      renderWithRouter(
        <AppContext.Provider value={context}>
          <SettingsContext.Provider value={settingsContext}>
            <DataCollection />
          </SettingsContext.Provider>
        </AppContext.Provider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('metrics-opt-out'));
      });

      expect(settingsContext.alertBarInfo?.success).toHaveBeenCalledTimes(1);
      expect(
        (settingsContext.alertBarInfo?.success as jest.Mock).mock.calls[0][0]
      ).toContain('Thanks! Sharing this data helps us improve');
    });

    it('displays an error message in the AlertBar', async () => {
      const settingsContext = mockSettingsContext();
      const context = mockAppContext({
        account: {
          ...account,
          metricsOpt: jest.fn().mockRejectedValue(new Error()),
        } as unknown as Account,
      });
      renderWithRouter(
        <AppContext.Provider value={context}>
          <SettingsContext.Provider value={settingsContext}>
            <DataCollection />
          </SettingsContext.Provider>
        </AppContext.Provider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('metrics-opt-out'));
      });

      expect(settingsContext.alertBarInfo?.error).toHaveBeenCalledTimes(1);
      expect(
        (settingsContext.alertBarInfo?.error as jest.Mock).mock.calls[0][0]
      ).toContain('Sorry, there was a problem');
    });
  });

  describe('Synced data row', () => {
    const renderWithFlag = (
      syncDataDeletionEnabled: boolean,
      attachedClients = MOCK_SYNC_CLIENTS,
      hasPassword = true
    ) => {
      const defaultConfig = getDefault();
      const config = {
        ...defaultConfig,
        featureFlags: {
          ...defaultConfig.featureFlags,
          syncDataDeletionEnabled,
        },
      };
      renderWithRouter(
        <AppContext.Provider
          value={mockAppContext({
            account: {
              ...account,
              attachedClients,
              hasPassword,
            } as unknown as Account,
            config,
          })}
        >
          <SettingsContext.Provider value={mockSettingsContext()}>
            <DataCollection />
          </SettingsContext.Provider>
        </AppContext.Provider>
      );
    };

    it('shows the row, linking to the delete flow, when the feature flag is on', () => {
      renderWithFlag(true);
      screen.getByRole('heading', { level: 3, name: 'Synced data' });
      expect(
        screen.getByRole('link', { name: 'Delete synced data' })
      ).toHaveAttribute('href', '/settings/delete_sync_data');
    });

    it('hides the row when no attached client can sync', () => {
      renderWithFlag(
        true,
        MOCK_SYNC_CLIENTS.map((c) => ({ ...c, isSyncCapable: false }))
      );
      expect(
        screen.queryByRole('heading', { level: 3, name: 'Synced data' })
      ).not.toBeInTheDocument();
    });

    it('hides the row when the account has no password', () => {
      renderWithFlag(true, MOCK_SYNC_CLIENTS, false);
      expect(
        screen.queryByRole('heading', { level: 3, name: 'Synced data' })
      ).not.toBeInTheDocument();
    });

    it('hides the row when the feature flag is off', () => {
      renderWithFlag(false);
      expect(
        screen.queryByRole('heading', { level: 3, name: 'Synced data' })
      ).not.toBeInTheDocument();
    });
  });
});
