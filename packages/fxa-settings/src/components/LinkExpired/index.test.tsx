/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { render, screen } from '@testing-library/react';
import { ResetPasswordLinkExpired, SigninLinkExpired } from '.';
import { mockAppContext, MOCK_ACCOUNT } from '../../models/mocks';
import { Account, AppContext } from '../../models';

function renderResetPasswordLinkExpiredWithAccount(account: Account) {
  render(
    <AppContext.Provider value={mockAppContext({ account })}>
      <LocationProvider>
        <ResetPasswordLinkExpired />
      </LocationProvider>
    </AppContext.Provider>
  );
}

function renderSigninLinkExpiredWithAccount(account: Account) {
  render(
    <AppContext.Provider value={mockAppContext({ account })}>
      <LocationProvider>
        <SigninLinkExpired />
      </LocationProvider>
    </AppContext.Provider>
  );
}

jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useLocation: () => {
    return {
      state: {
        email: MOCK_ACCOUNT.primaryEmail.email,
      },
    };
  },
}));

describe('ResetPasswordLinkExpired', () => {
  const account = {} as unknown as Account;

  it('renders the component as expected for an expired Reset Password link', () => {
    renderResetPasswordLinkExpiredWithAccount(account);

    screen.getByRole('heading', {
      name: 'Reset password link expired',
    });
    screen.getByText('The link you clicked to reset your password is expired.');
    screen.getByRole('button', {
      name: 'Receive new link',
    });
  });
  // TODO test CTA
});

describe('SigninLinkExpired', () => {
  const account = {} as unknown as Account;

  it('renders the component as expected for an expired Signin link', () => {
    renderSigninLinkExpiredWithAccount(account);

    screen.getByRole('heading', {
      name: 'Confirmation link expired',
    });
    screen.getByText('The link you clicked to confirm your email is expired.');
    screen.getByRole('button', {
      name: 'Receive new link',
    });
  });

  // TODO test CTA
});
