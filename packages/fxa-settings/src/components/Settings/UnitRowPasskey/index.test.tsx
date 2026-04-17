/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { LocationProvider } from '@reach/router';
import UnitRowPasskey from './index';
import { PasskeyRowData } from '../SubRow';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';

const mockJwtState = {};

jest.mock('../../../lib/cache', () => ({
  ...jest.requireActual('../../../lib/cache'),
  JwtTokenCache: {
    hasToken: jest.fn(() => true),
    subscribe: jest.fn((listener) => {
      return () => {}; // unsubscribe function
    }),
    getSnapshot: jest.fn(() => mockJwtState),
  },
  sessionToken: jest.fn(() => 'session-123'),
}));

describe('UnitRowPasskey', () => {
  const mockPasskeys: PasskeyRowData[] = [
    {
      credentialId: 'passkey-1',
      name: 'MacBook Pro',
      createdAt: new Date('2026-01-01').getTime(),
      lastUsedAt: new Date('2026-02-01').getTime(),
      prfEnabled: true,
    },
    {
      credentialId: 'passkey-2',
      name: 'iPhone 15',
      createdAt: new Date('2025-12-01').getTime(),
      lastUsedAt: new Date('2026-01-31').getTime(),
      prfEnabled: false,
    },
  ];
  const mockDeletePasskey = jest.fn().mockResolvedValue(undefined);

  const mockAccount = {
    ...mockAppContext().account,
    passkeys: mockPasskeys,
    deletePasskey: mockDeletePasskey,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderUnitRowPasskey = (passkeys: PasskeyRowData[] = mockPasskeys) => {
    return renderWithLocalizationProvider(
      <LocationProvider>
        <AppContext.Provider
          value={mockAppContext({
            account: { ...mockAccount, passkeys } as any,
          })}
        >
          <UnitRowPasskey />
        </AppContext.Provider>
      </LocationProvider>
    );
  };

  it('renders as expected', () => {
    renderUnitRowPasskey();
    expect(screen.getByText('Passkeys')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Make sign in easier and more secure by using your phone or other supported device to get into your account.'
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Learn more/ })).toHaveAttribute(
      'href',
      'https://support.mozilla.org/kb/placeholder-article'
    );
    expect(screen.getByRole('link', { name: 'Create' })).toHaveAttribute(
      'href',
      '/settings/passkeys/add'
    );
  });

  it('displays "Enabled" when passkeys exist', () => {
    renderUnitRowPasskey();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  it('displays "Not set" when no passkeys exist', () => {
    renderUnitRowPasskey([]);
    expect(screen.getByText('Not set')).toBeInTheDocument();
  });

  it('renders all passkey sub-rows', () => {
    renderUnitRowPasskey();
    expect(screen.getByText('MacBook Pro')).toBeInTheDocument();
    expect(screen.getByText('iPhone 15')).toBeInTheDocument();
  });

  it('does not show banner and Create is a link when below max', () => {
    renderUnitRowPasskey(mockPasskeys);
    expect(screen.queryByText(/You’ve used all/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create' })).toBeInTheDocument();
  });

  it('shows warning banner and disabled Create button when at max passkeys', () => {
    const atMaxPasskeys: PasskeyRowData[] = Array.from(
      { length: 10 },
      (_, i) => ({
        credentialId: `passkey-${i}`,
        name: `Passkey ${i}`,
        createdAt: new Date('2026-01-01').getTime(),
        lastUsedAt: new Date('2026-02-01').getTime(),
        prfEnabled: false,
      })
    );
    renderUnitRowPasskey(atMaxPasskeys);
    expect(screen.getByText(/You’ve used all 10 passkeys/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
  });
});
