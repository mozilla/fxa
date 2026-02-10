/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { LocationProvider } from '@reach/router';
import UnitRowPasskey, { Passkey } from './index';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

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
  const mockPasskeys: Passkey[] = [
    {
      id: 'passkey-1',
      name: 'MacBook Pro',
      createdAt: new Date('2026-01-01').getTime(),
      lastUsed: new Date('2026-02-01').getTime(),
      canSync: true,
    },
    {
      id: 'passkey-2',
      name: 'iPhone 15',
      createdAt: new Date('2025-12-01').getTime(),
      lastUsed: new Date('2026-01-31').getTime(),
      canSync: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderUnitRowPasskey = (passkeys: Passkey[] = mockPasskeys) => {
    return renderWithLocalizationProvider(
      <LocationProvider>
        <UnitRowPasskey passkeys={passkeys} />
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
    expect(
      screen.getByRole('link', { name: /How this protects your account/ })
    ).toHaveAttribute(
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

  it('displays "Not Set" when no passkeys exist', () => {
    renderUnitRowPasskey([]);
    expect(screen.getByText('Not Set')).toBeInTheDocument();
  });

  it('renders all passkey sub-rows', () => {
    renderUnitRowPasskey();
    expect(screen.getByText('MacBook Pro')).toBeInTheDocument();
    expect(screen.getByText('iPhone 15')).toBeInTheDocument();
  });
});
