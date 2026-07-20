/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import UnitRowPasskey from './index';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Passkey } from 'fxa-auth-client/browser';
import { Account, AppContext } from '../../../models';
import {
  MOCK_ACCOUNT,
  mockAppContext,
  mockSettingsContext,
} from '../../../models/mocks';
import { SettingsContext } from '../../../models/contexts/SettingsContext';
import { AlertBarInfo } from '../../../models/AlertBarInfo';

jest.mock('../SubRow', () => ({
  ...jest.requireActual('../SubRow'),
  PasskeySubRow: ({ passkey }: { passkey: Passkey }) => {
    return <div data-testid={`passkey-sub-row-${passkey.credentialId}`} />;
  },
}));

jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useFtlMsgResolver: () => ({
    getMsg: (_id: string, fallback: string) => fallback,
  }),
}));

jest.mock('../../../lib/passkeys/webauthn', () => ({
  isWebAuthnSupported: jest.fn(() => true),
}));

const { isWebAuthnSupported } = jest.requireMock(
  '../../../lib/passkeys/webauthn'
) as { isWebAuthnSupported: jest.Mock };

const mockPasskeys: Passkey[] = [
  {
    credentialId: 'passkey-1',
    name: 'MacBook Pro',
    createdAt: new Date('2026-01-01').getTime(),
    lastUsedAt: new Date('2026-02-01').getTime(),
    transports: ['internal'],
    aaguid: 'aaguid-1',
    backupEligible: true,
    backupState: true,
    prfEnabled: false,
  },
  {
    credentialId: 'passkey-2',
    name: 'iPhone 15',
    createdAt: new Date('2025-12-01').getTime(),
    lastUsedAt: new Date('2026-01-31').getTime(),
    transports: ['internal', 'hybrid'],
    aaguid: 'aaguid-2',
    backupEligible: false,
    backupState: false,
    prfEnabled: false,
  },
];

let mockAccount = {
  ...MOCK_ACCOUNT,
  passkeys: mockPasskeys,
};

let alertBarInfo: AlertBarInfo;
let alertErrorSpy: jest.SpyInstance;

describe('UnitRowPasskey', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isWebAuthnSupported.mockReturnValue(true);
    mockAccount = {
      ...MOCK_ACCOUNT,
      passkeys: mockPasskeys,
    };
    alertBarInfo = new AlertBarInfo();
    alertErrorSpy = jest.spyOn(alertBarInfo, 'error');
  });

  const renderUnitRowPasskey = () =>
    renderWithLocalizationProvider(
      <MemoryRouter>
        <AppContext.Provider
          value={mockAppContext({
            account: mockAccount as unknown as Account,
          })}
        >
          <SettingsContext.Provider
            value={mockSettingsContext({ alertBarInfo })}
          >
            <UnitRowPasskey />
          </SettingsContext.Provider>
        </AppContext.Provider>
      </MemoryRouter>
    );

  it('renders header and description', async () => {
    renderUnitRowPasskey();
    await waitFor(() => {
      expect(screen.getByText('Passkeys')).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        'Make sign in easier and more secure by using your phone or other supported device to get into your account.'
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Learn more/ })).toHaveAttribute(
      'href',
      'https://support.mozilla.org/kb/use-passkey-mozilla-account'
    );
  });

  it('displays "Enabled" when passkeys exist', async () => {
    renderUnitRowPasskey();
    await waitFor(() => {
      expect(screen.getByText('Enabled')).toBeInTheDocument();
    });
  });

  it('displays "Not set" when no passkeys exist', async () => {
    mockAccount.passkeys = [];
    renderUnitRowPasskey();
    await waitFor(() => {
      expect(screen.getByText('Not set')).toBeInTheDocument();
    });
  });

  it('shows create link when WebAuthn is supported', async () => {
    renderUnitRowPasskey();
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Create' })).toHaveAttribute(
        'href',
        '/settings/passkeys/add'
      );
    });
  });

  it('shows a Create button (not a link) and does not push an alert until clicked when WebAuthn is not supported', async () => {
    isWebAuthnSupported.mockReturnValue(false);
    renderUnitRowPasskey();
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Create' })
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('link', { name: 'Create' })
    ).not.toBeInTheDocument();
    expect(alertErrorSpy).not.toHaveBeenCalled();
  });

  it('pushes an unsupported-passkey alert when the user clicks Create and WebAuthn is not supported', async () => {
    isWebAuthnSupported.mockReturnValue(false);
    renderUnitRowPasskey();
    const createButton = await screen.findByRole('button', { name: 'Create' });
    fireEvent.click(createButton);
    expect(alertErrorSpy).toHaveBeenCalledTimes(1);
    const [alertContent] = alertErrorSpy.mock.calls[0];
    expect(React.isValidElement(alertContent)).toBe(true);

    // Render the captured alert node and assert the user-visible content.
    // Scope queries to the alert's container so they don't collide with the
    // existing "Learn more" link that lives inside UnitRowPasskey itself.
    const { container } = renderWithLocalizationProvider(<>{alertContent}</>);
    expect(
      within(container).getByText(
        'Your browser or device doesn’t support passkeys.'
      )
    ).toBeInTheDocument();
    expect(
      within(container).getByRole('link', { name: /Learn more/ })
    ).toHaveAttribute(
      'href',
      'https://support.mozilla.org/kb/troubleshoot-passkey-mozilla-account'
    );
  });

  it('shows warning banner and disabled Create button when at max passkeys', async () => {
    const atMaxPasskeys: Passkey[] = Array.from({ length: 10 }, (_, i) => ({
      credentialId: `passkey-${i}`,
      name: `Passkey ${i}`,
      createdAt: new Date('2026-01-01').getTime(),
      lastUsedAt: new Date('2026-02-01').getTime(),
      transports: ['internal'],
      aaguid: `aaguid-${i}`,
      backupEligible: true,
      backupState: false,
      prfEnabled: false,
    }));
    mockAccount.passkeys = atMaxPasskeys;
    renderUnitRowPasskey();
    await waitFor(() => {
      expect(
        screen.getByText(/You’ve used all 10 passkeys/)
      ).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
  });
});
