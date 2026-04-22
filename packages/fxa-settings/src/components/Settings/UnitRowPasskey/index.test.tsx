/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { LocationProvider } from '@reach/router';
import UnitRowPasskey from './index';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Passkey } from 'fxa-auth-client/browser';
import { Account, AppContext } from '../../../models';
import { MOCK_ACCOUNT, mockAppContext } from '../../../models/mocks';

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
  isWebAuthnLevel3Supported: jest.fn(() => true),
}));

const { isWebAuthnLevel3Supported } = jest.requireMock(
  '../../../lib/passkeys/webauthn'
) as { isWebAuthnLevel3Supported: jest.Mock };

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

describe('UnitRowPasskey', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isWebAuthnLevel3Supported.mockReturnValue(true);
    mockAccount = {
      ...MOCK_ACCOUNT,
      passkeys: mockPasskeys,
    };
  });

  const renderUnitRowPasskey = () => {
    return renderWithLocalizationProvider(
      <LocationProvider>
        <AppContext.Provider
          value={mockAppContext({
            account: mockAccount as unknown as Account,
          })}
        >
          <UnitRowPasskey />
        </AppContext.Provider>
      </LocationProvider>
    );
  };

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
      'https://support.mozilla.org/kb/placeholder-article'
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

  it('shows a Create button (not a link) and no error banner until clicked when WebAuthn is not supported', async () => {
    isWebAuthnLevel3Supported.mockReturnValue(false);
    renderUnitRowPasskey();
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Create' })
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('link', { name: 'Create' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Your browser or device doesn’t support passkeys.')
    ).not.toBeInTheDocument();
  });

  it('reveals the error banner when the user clicks Create and WebAuthn is not supported', async () => {
    isWebAuthnLevel3Supported.mockReturnValue(false);
    renderUnitRowPasskey();
    const createButton = await screen.findByRole('button', { name: 'Create' });
    fireEvent.click(createButton);
    expect(
      screen.getByText('Your browser or device doesn’t support passkeys.')
    ).toBeInTheDocument();
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
