/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { render, screen } from '@testing-library/react';
import { LinkExpiredResetPassword } from '.';
import { mockAppContext, MOCK_ACCOUNT } from '../../models/mocks';
import { Account, AppContext } from '../../models';

const viewName = 'example-view-name';

function renderLinkExpiredResetPasswordWithAccount(account: Account) {
  render(
    <AppContext.Provider value={mockAppContext({ account })}>
      <LocationProvider>
        <LinkExpiredResetPassword {...{ viewName }} />
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

describe('LinkExpiredResetPassword', () => {
  const account = {} as unknown as Account;

  it('renders the component as expected for an expired Reset Password link', () => {
    renderLinkExpiredResetPasswordWithAccount(account);

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
