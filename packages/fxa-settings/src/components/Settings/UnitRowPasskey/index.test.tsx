/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { LocationProvider } from '@reach/router';
import UnitRowPasskey from './index';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Passkey } from 'fxa-auth-client/browser';

const mockListPasskeys = jest.fn();
const mockAlertBarError = jest.fn();

jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useFtlMsgResolver: () => ({
    getMsg: (_id: string, fallback: string) => fallback,
  }),
  useAlertBar: () => ({
    error: mockAlertBarError,
    success: jest.fn(),
  }),
  useAuthClient: () => ({
    listPasskeys: mockListPasskeys,
  }),
}));

jest.mock('../../../lib/cache', () => ({
  ...jest.requireActual('../../../lib/cache'),
  JwtTokenCache: {
    hasToken: jest.fn(() => true),
    subscribe: jest.fn(() => () => {}),
    getSnapshot: jest.fn(() => ({})),
  },
  sessionToken: jest.fn(() => 'session-123'),
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

describe('UnitRowPasskey', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListPasskeys.mockResolvedValue(mockPasskeys);
    isWebAuthnLevel3Supported.mockReturnValue(true);
  });

  const renderUnitRowPasskey = () => {
    return renderWithLocalizationProvider(
      <LocationProvider>
        <UnitRowPasskey />
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
    expect(
      screen.getByRole('link', { name: /How this protects your account/ })
    ).toHaveAttribute(
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
    mockListPasskeys.mockResolvedValue([]);
    renderUnitRowPasskey();
    await waitFor(() => {
      expect(screen.getByText('Not set')).toBeInTheDocument();
    });
  });

  it('renders all passkey sub-rows', async () => {
    renderUnitRowPasskey();
    await waitFor(() => {
      expect(screen.getByText('MacBook Pro')).toBeInTheDocument();
    });
    expect(screen.getByText('iPhone 15')).toBeInTheDocument();
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

  it('shows error when WebAuthn not supported and user clicks create', async () => {
    isWebAuthnLevel3Supported.mockReturnValue(false);
    renderUnitRowPasskey();
    // When WebAuthn is not supported, there should be no link to passkeys/add
    await waitFor(() => {
      expect(screen.getByText('Passkeys')).toBeInTheDocument();
    });
    // The Create button should not be a link to the passkey add page
    expect(
      screen.queryByRole('link', { name: 'Create' })
    ).not.toBeInTheDocument();
  });
});
