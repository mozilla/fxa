/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ConfirmResetPassword, { viewName } from '.';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { MOCK_EMAIL, MOCK_PASSWORD_FORGOT_TOKEN } from './mocks';
import { REACT_ENTRYPOINT } from '../../../constants';
import { LocationProvider } from '@reach/router';
import { Account, AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';
import { logPageViewEvent } from '../../../lib/metrics';

jest.mock('../../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  logPageViewEvent: jest.fn(),
}));

function renderWithAccount(account: Account) {
  render(
    <AppContext.Provider value={mockAppContext({ account })}>
      <LocationProvider>
        <ConfirmResetPassword />
      </LocationProvider>
    </AppContext.Provider>
  );
}

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
  useLocation: () => {
    return {
      state: {
        email: MOCK_EMAIL,
        passwordForgotToken: MOCK_PASSWORD_FORGOT_TOKEN,
      },
    };
  },
}));

describe('ConfirmResetPassword', () => {
  // TODO enable l10n testing
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders ConfirmResetPassword component as expected', () => {
    const account = {
      resetPasswordStatus: jest.fn().mockResolvedValue(true),
    } as unknown as Account;

    renderWithAccount(account);

    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Reset email sent');

    const confirmPwResetInstructions = screen.getByText(
      `Click the link emailed to ${MOCK_EMAIL} within the next hour to create a new password.`
    );
    expect(confirmPwResetInstructions).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Not in inbox or spam folder? Resend',
      })
    ).toBeInTheDocument();
  });

  it('emits the expected metrics on render', async () => {
    render(<ConfirmResetPassword />);
    expect(logPageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  it('renders a "Remember your password?" link', () => {
    render(<ConfirmResetPassword />);
    expect(
      screen.getByRole('link', { name: 'Remember your password? Sign in' })
    ).toBeInTheDocument();
  });
});
