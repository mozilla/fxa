/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import React from 'react';
import { screen } from '@testing-library/react';
import {
  mockAppContext,
  mockSession,
  renderWithRouter,
} from '../../../models/mocks';
import { Account, AppContext } from '../../../models';
import { VerifiedSessionGuard } from '.';

it('renders the content when verified', async () => {
  const account = {
    primaryEmail: {
      email: 'smcarthur@mozilla.com',
    },
  } as unknown as Account;
  const onDismiss = jest.fn();
  const onError = jest.fn();
  renderWithRouter(
    <AppContext.Provider
      value={mockAppContext({ account, session: mockSession(true, false) })}
    >
      <VerifiedSessionGuard {...{ onDismiss, onError }}>
        <div data-testid="children">Content</div>
      </VerifiedSessionGuard>
    </AppContext.Provider>
  );

  expect(screen.getByTestId('children')).toBeInTheDocument();
});

it('renders the guard when unverified', async () => {
  const onDismiss = jest.fn();
  const onError = jest.fn();
  const account = {
    primaryEmail: {
      email: 'smcarthur@mozilla.com',
    },
  } as unknown as Account;
  renderWithRouter(
    <AppContext.Provider
      value={mockAppContext({ account, session: mockSession(false) })}
    >
      <VerifiedSessionGuard {...{ onDismiss, onError }}>
        <div>Content</div>
      </VerifiedSessionGuard>
    </AppContext.Provider>
  );

  expect(screen.getByTestId('modal-verify-session')).toBeInTheDocument();
});
