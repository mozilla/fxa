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

import { Page2faReplaceRecoveryCodes } from '.';
import { SettingsContext } from '../../../models/contexts/SettingsContext';

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

const account = {
  ...MOCK_ACCOUNT,
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

async function renderPage2faReplaceRecoveryCodes() {
  await act(async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account, session, config })}>
        <SettingsContext.Provider value={mockSettingsContext()}>
          <Page2faReplaceRecoveryCodes />
        </SettingsContext.Provider>
      </AppContext.Provider>
    );
  });
}

describe('Page2faReplaceRecoveryCodes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders', async () => {
    await renderPage2faReplaceRecoveryCodes();
    const settingsContext = mockSettingsContext();

    expect(screen.getByTestId('2fa-recovery-codes')).toBeInTheDocument();

    expect(screen.getByTestId('2fa-recovery-codes')).toHaveTextContent(
      mockRecoveryCodes[0]
    );

    expect(screen.getByTestId('ack-recovery-code')).toBeInTheDocument();

    expect(screen.getByTestId('databutton-download')).toHaveAttribute(
      'download',
      expect.stringContaining('Backup authentication codes')
    );
    expect(settingsContext.alertBarInfo?.error).not.toBeCalled();
  });

  it('displays an error when fails to fetch new backup authentication codes', async () => {
    (totpUtils.generateRecoveryCodes as jest.Mock).mockRejectedValueOnce(
      new Error('wat')
    );
    const context = mockAppContext({ account, session, config });
    const settingsContext = mockSettingsContext();
    await act(async () => {
      renderWithRouter(
        <AppContext.Provider value={context}>
          <SettingsContext.Provider value={settingsContext}>
            <Page2faReplaceRecoveryCodes />
          </SettingsContext.Provider>
        </AppContext.Provider>
      );
    });
    expect(settingsContext.alertBarInfo?.error).toHaveBeenCalledTimes(1);
    expect(settingsContext.alertBarInfo?.error).toHaveBeenCalledWith(
      'There was a problem creating your backup authentication codes'
    );
  });

  it('displays an error when fails to update backup authentication codes', async () => {
    const account = {
      ...MOCK_ACCOUNT,
      updateRecoveryCodes: jest.fn().mockRejectedValue(new Error('wat')),
    } as unknown as Account;
    const context = mockAppContext({ account, config });
    const settingsContext = mockSettingsContext();
    await act(async () => {
      renderWithRouter(
        <AppContext.Provider value={context}>
          <SettingsContext.Provider value={settingsContext}>
            <Page2faReplaceRecoveryCodes />
          </SettingsContext.Provider>
        </AppContext.Provider>
      );
    });
    fireEvent.click(screen.getByTestId('ack-recovery-code'));
    await typeByTestIdFn('recovery-code-input-field')(mockRecoveryCodes[0]);
    fireEvent.click(screen.getByTestId('submit-recovery-code'));

    await waitFor(() => {
      expect(settingsContext.alertBarInfo?.error).toHaveBeenCalledTimes(1);
      expect(settingsContext.alertBarInfo?.error).toHaveBeenCalledWith(
        'There was a problem replacing your backup authentication codes'
      );
    });
  });

  it('forces users to validate backup authentication code', async () => {
    await renderPage2faReplaceRecoveryCodes();
    fireEvent.click(screen.getByTestId('ack-recovery-code'));

    await waitFor(() =>
      expect(screen.getByTestId('submit-recovery-code')).toBeDisabled()
    );
  });

  it('will not allow bad backup authentication code', async () => {
    await renderPage2faReplaceRecoveryCodes();
    fireEvent.click(screen.getByTestId('ack-recovery-code'));
    await typeByTestIdFn('recovery-code-input-field')('xyz');
    fireEvent.click(screen.getByTestId('submit-recovery-code'));

    await waitFor(() =>
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    );
  });

  it('allows user to finish', async () => {
    await renderPage2faReplaceRecoveryCodes();

    fireEvent.click(screen.getByTestId('ack-recovery-code'));
    await typeByTestIdFn('recovery-code-input-field')(mockRecoveryCodes[0]);
    fireEvent.click(screen.getByTestId('submit-recovery-code'));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        SETTINGS_PATH + '#two-step-authentication',
        { replace: true }
      )
    );
  });
});
