/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { SETTINGS_PATH } from '../../../constants';
import { Config } from '../../../lib/config';
import { totpUtils } from '../../../lib/totp-utils';
import { typeByTestIdFn } from '../../../lib/test-utils';
import { Account, AppContext } from '../../../models';
import {
  MOCK_ACCOUNT,
  mockAppContext,
  mockSession,
  mockSettingsContext,
  renderWithRouter,
} from '../../../models/mocks';

import { Page2faReplaceBackupCodes } from '.';
import { SettingsContext } from '../../../models/contexts/SettingsContext';
import { MfaContext } from '../MfaGuard';

const mockRecoveryCodes = ['0123456789'];

jest.mock('../../../models/AlertBarInfo');

jest.mock('../../../lib/totp-utils', () => {
  const mockBackupCodes = ['0123456789'];
  return {
    totpUtils: {
      generateRecoveryCodes: jest.fn().mockResolvedValue(mockBackupCodes),
    },
  };
});

// Account with existing backup codes (replace scenario)
const accountWithExistingCodes = {
  ...MOCK_ACCOUNT,
  backupCodes: {
    hasBackupCodes: true,
    count: 5,
  },
  updateRecoveryCodes: jest.fn().mockResolvedValue({ success: true }),
} as unknown as Account;

// Account with no backup codes (create new scenario)
const accountWithNoCodes = {
  ...MOCK_ACCOUNT,
  backupCodes: {
    hasBackupCodes: false,
    count: 0,
  },
  updateRecoveryCodes: jest.fn().mockResolvedValue({ success: true }),
} as unknown as Account;

const session = mockSession(true, false);

const config = {
  l10n: { strict: false },
  recoveryCodes: {
    count: 1,
    length: 10,
  },
} as Config;

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

window.URL.createObjectURL = jest.fn();

async function renderPage2faReplaceBackupCodes(
  account = accountWithExistingCodes
) {
  await act(async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account, session, config })}>
        <SettingsContext.Provider value={mockSettingsContext()}>
          <MfaContext.Provider value="2fa">
            <Page2faReplaceBackupCodes />
          </MfaContext.Provider>
        </SettingsContext.Provider>
      </AppContext.Provider>
    );
  });
}

describe('Page2faReplaceBackupCodes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the download step', async () => {
    await renderPage2faReplaceBackupCodes();
    const settingsContext = mockSettingsContext();

    expect(screen.getByTestId('2fa-backup-codes')).toBeInTheDocument();

    expect(screen.getByTestId('2fa-backup-codes')).toHaveTextContent(
      mockRecoveryCodes[0]
    );

    expect(screen.getByText('Continue')).toBeInTheDocument();

    expect(screen.getByTestId('databutton-download')).toHaveAttribute(
      'download',
      expect.stringContaining('Backup authentication codes')
    );
    expect(settingsContext.alertBarInfo?.error).not.toHaveBeenCalled();
  });

  it('displays an error when fails to fetch new backup authentication codes', async () => {
    (totpUtils.generateRecoveryCodes as jest.Mock).mockRejectedValueOnce(
      new Error('wat')
    );
    const context = mockAppContext({
      account: accountWithExistingCodes,
      session,
      config,
    });
    const settingsContext = mockSettingsContext();
    await act(async () => {
      renderWithRouter(
        <AppContext.Provider value={context}>
          <SettingsContext.Provider value={settingsContext}>
            <MfaContext.Provider value="2fa">
              <Page2faReplaceBackupCodes />
            </MfaContext.Provider>
          </SettingsContext.Provider>
        </AppContext.Provider>
      );
    });
    expect(settingsContext.alertBarInfo?.error).toHaveBeenCalledTimes(1);
    expect(settingsContext.alertBarInfo?.error).toHaveBeenCalledWith(
      'There was a problem replacing your backup authentication codes'
    );
  });

  it('displays create error when fails to fetch new backup authentication codes for user with no existing codes', async () => {
    (totpUtils.generateRecoveryCodes as jest.Mock).mockRejectedValueOnce(
      new Error('wat')
    );
    const context = mockAppContext({
      account: accountWithNoCodes,
      session,
      config,
    });
    const settingsContext = mockSettingsContext();
    await act(async () => {
      renderWithRouter(
        <AppContext.Provider value={context}>
          <SettingsContext.Provider value={settingsContext}>
            <MfaContext.Provider value="2fa">
              <Page2faReplaceBackupCodes />
            </MfaContext.Provider>
          </SettingsContext.Provider>
        </AppContext.Provider>
      );
    });
    expect(settingsContext.alertBarInfo?.error).toHaveBeenCalledTimes(1);
    expect(settingsContext.alertBarInfo?.error).toHaveBeenCalledWith(
      'There was a problem creating your backup authentication codes'
    );
  });

  it('navigates to confirm step when continue is clicked', async () => {
    await renderPage2faReplaceBackupCodes();

    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(
        screen.getByText('Enter backup authentication code')
      ).toBeInTheDocument();
    });
  });

  it('displays an error when fails to update backup authentication codes', async () => {
    const account = {
      ...accountWithExistingCodes,
      updateRecoveryCodes: jest.fn().mockRejectedValue(new Error('wat')),
    } as unknown as Account;
    const context = mockAppContext({ account, config });
    const settingsContext = mockSettingsContext();
    await act(async () => {
      renderWithRouter(
        <AppContext.Provider value={context}>
          <SettingsContext.Provider value={settingsContext}>
            <MfaContext.Provider value="2fa">
              <Page2faReplaceBackupCodes />
            </MfaContext.Provider>
          </SettingsContext.Provider>
        </AppContext.Provider>
      );
    });

    // Navigate to confirm step
    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(
        screen.getByText('Enter backup authentication code')
      ).toBeInTheDocument();
    });

    await typeByTestIdFn('input-field')(mockRecoveryCodes[0]);
    fireEvent.click(screen.getByText('Finish'));

    await waitFor(() => {
      expect(
        screen.getByText(
          'There was a problem replacing your backup authentication codes'
        )
      ).toBeInTheDocument();
    });
  });

  it('forces users to validate backup authentication code', async () => {
    await renderPage2faReplaceBackupCodes();

    // Navigate to confirm step
    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(
        screen.getByText('Enter backup authentication code')
      ).toBeInTheDocument();
    });

    await waitFor(() => expect(screen.getByText('Finish')).toBeDisabled());
  });

  it('will not allow bad backup authentication code', async () => {
    await renderPage2faReplaceBackupCodes();

    // Navigate to confirm step
    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(
        screen.getByText('Enter backup authentication code')
      ).toBeInTheDocument();
    });

    // Enter a valid format code but wrong value
    await typeByTestIdFn('input-field')('1234567890');

    // Wait for button to be enabled
    await waitFor(() => expect(screen.getByText('Finish')).not.toBeDisabled());

    fireEvent.click(screen.getByText('Finish'));

    await waitFor(() =>
      expect(
        screen.getByText('Incorrect backup authentication code')
      ).toBeInTheDocument()
    );
  });

  it('allows user to finish', async () => {
    await renderPage2faReplaceBackupCodes();

    // Navigate to confirm step
    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(
        screen.getByText('Enter backup authentication code')
      ).toBeInTheDocument();
    });

    await typeByTestIdFn('input-field')(mockRecoveryCodes[0]);
    fireEvent.click(screen.getByText('Finish'));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        SETTINGS_PATH + '#two-step-authentication',
        { replace: true }
      )
    );
  });

  it('displays create error when fails to update backup authentication codes for user with no existing codes', async () => {
    const account = {
      ...accountWithNoCodes,
      updateRecoveryCodes: jest.fn().mockRejectedValue(new Error('wat')),
    } as unknown as Account;
    const context = mockAppContext({ account, config });
    const settingsContext = mockSettingsContext();
    await act(async () => {
      renderWithRouter(
        <AppContext.Provider value={context}>
          <SettingsContext.Provider value={settingsContext}>
            <MfaContext.Provider value="2fa">
              <Page2faReplaceBackupCodes />
            </MfaContext.Provider>
          </SettingsContext.Provider>
        </AppContext.Provider>
      );
    });

    // Navigate to confirm step
    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(
        screen.getByText('Enter backup authentication code')
      ).toBeInTheDocument();
    });

    await typeByTestIdFn('input-field')(mockRecoveryCodes[0]);
    fireEvent.click(screen.getByText('Finish'));

    await waitFor(() => {
      expect(
        screen.getByText(
          'There was a problem creating your backup authentication codes'
        )
      ).toBeInTheDocument();
    });
  });
});
