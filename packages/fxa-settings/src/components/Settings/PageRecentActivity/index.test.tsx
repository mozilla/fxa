/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import { screen } from '@testing-library/react';
import { renderWithRouter, mockAppContext } from '../../../models/mocks';
import PageRecentActivity from '.';
import { Account, AppContext } from '../../../models';
import { MOCK_SECURITY_EVENTS } from './mocks';
import { HIDDEN_SECURITY_EVENT_NAMES } from './SecurityEvent';

const account = {
  primaryEmail: {
    email: 'foxy@mozilla.com',
  },
  getSecurityEvents: jest.fn().mockResolvedValue(MOCK_SECURITY_EVENTS),
} as unknown as Account;

const render = (acct: Account = account) =>
  renderWithRouter(
    <AppContext.Provider value={mockAppContext({ account: acct })}>
      <PageRecentActivity />
    </AppContext.Provider>
  );

describe('Recent Account Activity', () => {
  it('renders', async () => {
    // One label per mapped event name in SecurityEventName, excluding the
    // events listed in HIDDEN_SECURITY_EVENT_NAMES.
    const expectedLabels = [
      'Account created',
      'Account disabled',
      'Account enabled',
      'Account login initiated',
      'Password reset initiated',
      'Email bounces cleared',
      'Account login attempt failed',
      'Two-step authentication enabled',
      'Two-step authentication requested',
      'Two-step authentication failed',
      'Two-step authentication successful',
      'Two-step authentication removed',
      'Password reset requested',
      'Password reset successful',
      'Account recovery key enabled',
      'Account recovery key verification failed',
      'Account recovery key verification successful',
      'Account recovery key removed',
      'New password added',
      'Password changed',
      'Secondary email address added',
      'Secondary email address removed',
      'Primary and secondary emails swapped',
      'Logged out of session',
      'Recovery phone code sent',
      'Recovery phone setup completed',
      'Sign-in with recovery phone completed',
      'Sign-in with recovery phone failed',
      'Recovery phone removed',
      'Recovery codes replaced',
      'Recovery codes created',
      'Sign-in with recovery codes completed',
      'Reset password confirmation code sent',
      'Reset password confirmation code verified',
      'Password reset required',
      'Password reset with recovery phone completed',
      'Password reset with recovery phone failed',
      'Recovery phone replaced',
      'Recovery phone replacement failed',
      'Two-step authentication replaced',
      'Two-step authentication replacement failed',
      'Recovery phone setup failed',
      'Account change authorization requested',
      'Account change authorized',
      'Account change authorization failed',
      'Passkey added',
      'Passkey registration failed',
      'Passkey removed',
      'Sign-in with passkey completed',
      'Sign-in with passkey failed',
      'Passwordless sign-in code sent',
      'Passwordless sign-in code failed',
      'Passwordless sign-in code verified',
      'Passwordless account registration completed',
      'Recovery codes set',
    ];

    render();

    expect(screen.getByTestId('flow-container')).toBeInTheDocument();
    expect(screen.getByTestId('flow-container-back-btn')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Recent account activity' })
    ).toBeInTheDocument();

    expect(await screen.findByText(expectedLabels[0])).toBeInTheDocument();
    expect(account.getSecurityEvents).toHaveBeenCalled();
    for (const label of expectedLabels.slice(1)) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('filters HIDDEN_SECURITY_EVENT_NAMES before rendering', async () => {
    const accountWithHiddenAndVisible = {
      primaryEmail: { email: 'foxy@mozilla.com' },
      getSecurityEvents: jest.fn().mockResolvedValue([
        { name: 'account.create', createdAt: Date.now(), verified: true },
        ...Array.from(HIDDEN_SECURITY_EVENT_NAMES, (name) => ({
          name,
          createdAt: Date.now(),
          verified: true,
        })),
      ]),
    } as unknown as Account;

    render(accountWithHiddenAndVisible);

    // findByText gates on the post-fetch render. If the filter regressed,
    // each hidden event would render an additional <li> and the count
    // assertion below would fail.
    expect(await screen.findByText('Account created')).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(1);
  });

  it('falls back to "Other account activity" for unrecognized event names', async () => {
    const unknownAccount = {
      primaryEmail: { email: 'foxy@mozilla.com' },
      getSecurityEvents: jest.fn().mockResolvedValue([
        {
          name: 'account.some_future_event',
          createdAt: Date.now(),
          verified: true,
        },
      ]),
    } as unknown as Account;

    render(unknownAccount);

    expect(
      await screen.findByText('Other account activity')
    ).toBeInTheDocument();
  });
});
