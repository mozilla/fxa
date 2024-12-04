/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import Security from '.';
import { mockAppContext, renderWithRouter } from '../../../models/mocks';
import { Account, AppContext } from '../../../models';
import { MOCK_EMAIL } from '../../../pages/mocks';

describe('Security', () => {
  it('renders "fresh load" <Security/> with correct content', async () => {
    const account = {
      avatar: { url: null, id: null },
      primaryEmail: {
        email: MOCK_EMAIL,
      },
      emails: [],
      displayName: 'Jody',
      passwordCreated: 123456789,
      hasPassword: true,
      recoveryKey: {
        exists: false,
      },
      totp: { exists: false },
      backupCodes: { hasBackupCodes: false, count: 0 },
    } as unknown as Account;
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <Security />
      </AppContext.Provider>
    );

    expect(await screen.findByText('Account recovery key')).toBeTruthy();
    expect(await screen.findByText('Two-step authentication')).toBeTruthy();

    expect(await screen.findAllByText('Not Set')).toHaveLength(1);
    expect(await screen.findAllByText('Disabled')).toHaveLength(1);
  });

  it('renders "enabled two factor" and "account recovery key present" <Security/> with correct content', async () => {
    const account = {
      avatar: { url: null, id: null },
      primaryEmail: {
        email: MOCK_EMAIL,
      },
      emails: [],
      displayName: 'Jody',
      passwordCreated: 0,
      recoveryKey: { exists: true },
      totp: { exists: true, verified: true },
      backupCodes: { hasBackupCodes: true, count: 3 },
    } as unknown as Account;
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <Security />
      </AppContext.Provider>
    );

    const result = await screen.findAllByText('Enabled');
    expect(result).toHaveLength(2);
  });

  describe('Password row', () => {
    it('renders as expected when account has a password', async () => {
      const account = {
        recoveryKey: { exists: false },
        totp: { exists: false },
        backupCodes: { hasBackupCodes: false, count: 0 },
        primaryEmail: {
          email: MOCK_EMAIL,
        },
        passwordCreated: 1234567890,
        hasPassword: true,
      } as unknown as Account;
      const createDate = `1/${new Date(1234567890).getDate()}/1970`;
      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <Security />
        </AppContext.Provider>
      );
      const passwordRouteLink = screen.getByTestId('password-unit-row-route');

      await screen.findByText('••••••••••••••••••');
      await screen.findByText(`Created ${createDate}`);

      expect(passwordRouteLink).toHaveTextContent('Change');
      expect(passwordRouteLink).toHaveAttribute(
        'href',
        '/settings/change_password'
      );
    });

    it('renders as expected when account does not have a password', async () => {
      const account = {
        recoveryKey: { exists: false },
        totp: { exists: false },
        backupCodes: { hasBackupCodes: false, count: 0 },
        primaryEmail: {
          email: MOCK_EMAIL,
        },
        passwordCreated: 0,
        hasPassword: false,
      } as unknown as Account;
      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <Security />
        </AppContext.Provider>
      );

      const passwordRouteLink = screen.getByTestId('password-unit-row-route');

      await screen.findByText('Set a password', { exact: false });
      expect(await screen.findAllByText('Not Set')).toHaveLength(2);
      expect(await screen.findAllByText('Disabled')).toHaveLength(1);

      expect(passwordRouteLink).toHaveTextContent('Create');
      expect(passwordRouteLink).toHaveAttribute(
        'href',
        '/settings/create_password'
      );
    });
  });
});
