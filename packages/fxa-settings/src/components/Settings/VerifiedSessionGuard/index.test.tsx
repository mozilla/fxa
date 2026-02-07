/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import React from 'react';
import { screen, act } from '@testing-library/react';
import {
  mockAppContext,
  mockSession,
  renderWithRouter,
} from '../../../models/mocks';
import { Account, AppContext } from '../../../models';
import { VerifiedSessionGuard } from '.';
import AuthClient from 'fxa-auth-client/browser';

it('renders the content when verified', async () => {
  const account = {
    primaryEmail: {
      email: 'smcarthur@mozilla.com',
    },
  } as unknown as Account;
  const onDismiss = jest.fn();
  const onError = jest.fn();

  await act(
    async () =>
      await renderWithRouter(
        <AppContext.Provider
          value={mockAppContext({
            account,
            session: mockSession(true, false),
            authClient: {
              sessionStatus: () => {
                return {
                  state: 'verified',
                  details: {
                    sessionVerified: true,
                  },
                };
              },
            } as unknown as AuthClient,
          })}
        >
          <VerifiedSessionGuard {...{ onDismiss, onError }}>
            <div data-testid="children">Content</div>
          </VerifiedSessionGuard>
        </AppContext.Provider>
      )
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

  await act(
    async () =>
      await renderWithRouter(
        <AppContext.Provider
          value={mockAppContext({
            account,
            session: mockSession(false),
            authClient: {
              sessionStatus: () => {
                return {
                  state: 'unverified',
                  details: {
                    sessionVerified: false,
                  },
                };
              },
            } as unknown as AuthClient,
          })}
        >
          <VerifiedSessionGuard {...{ onDismiss, onError }}>
            <div>Content</div>
          </VerifiedSessionGuard>
        </AppContext.Provider>
      )
  );

  expect(screen.getByTestId('modal-verify-session')).toBeInTheDocument();
});
