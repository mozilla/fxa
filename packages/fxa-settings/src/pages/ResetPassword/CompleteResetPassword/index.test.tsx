/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { mockAppContext } from '../../../models/mocks';
import { AppContext, Account } from '../../../models';
import CompleteResetPassword from '.';
import { logPageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT, SHOW_BALLOON_TIMEOUT } from '../../../constants';
import { LocationProvider } from '@reach/router';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';

const PASSWORD = 'passwordzxcv';

jest.mock('../../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  logPageViewEvent: jest.fn(),
}));

let account: Account;
let mockToken: string,
  mockCode: string,
  mockEmail: string,
  mockPasswordHash: string;
const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
  useLocation: () => {
    return {
      href: `http://localhost.com/?&token=${mockToken}&code=${mockCode}&email=${mockEmail}&emailToHashWith=${mockPasswordHash}`,
    };
  },
}));

function renderWithAccount(account: Account) {
  render(
    <AppContext.Provider value={mockAppContext({ account })}>
      <LocationProvider>
        <CompleteResetPassword />
      </LocationProvider>
    </AppContext.Provider>
  );
}

describe('CompleteResetPassword page', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });
  beforeEach(() => {
    mockCode = 'code';
    mockToken = 'token';
    mockEmail = 'boo@boo.boo';
    mockPasswordHash = 'hash';

    account = {
      resetPasswordStatus: jest.fn().mockResolvedValue(true),
      completeResetPassword: jest.fn().mockResolvedValue(true),
    } as unknown as Account;
  });

  it('renders the component as expected', () => {
    renderWithAccount(account);
    // testAllL10n(screen, bundle);

    screen.getByRole('heading', {
      name: 'Create new password',
    });
    screen.getByLabelText('New password');
    screen.getByLabelText('Re-enter password');
    screen.getByRole('button', { name: 'Reset password' });
    screen.getByRole('link', {
      name: 'Remember your password? Sign in',
    });
  });

  it('displays password requirements when the new password field is in focus', async () => {
    renderWithAccount(account);

    const newPasswordField = screen.getByTestId('new-password-input-field');

    expect(screen.queryByText('Password requirements')).not.toBeInTheDocument();

    fireEvent.focus(newPasswordField);
    await waitFor(
      () => {
        expect(screen.getByText('Password requirements')).toBeVisible();
      },
      {
        timeout: SHOW_BALLOON_TIMEOUT,
      }
    );
  });

  it('renders the component as expected when provided with an expired link', async () => {
    account = {
      resetPasswordStatus: jest.fn().mockResolvedValue(false),
    } as unknown as Account;

    await act(async () => {
      renderWithAccount(account);
    });

    screen.getByRole('heading', {
      name: 'Reset password link expired',
    });
    screen.getByText('The link you clicked to reset your password is expired.');
    screen.getByRole('button', {
      name: 'Receive new link',
    });
  });


  it('renders the component as expected when provided with a damaged link', async () => {
    mockToken = '';
    renderWithAccount(account);

    await waitFor(() => {
      screen.getByRole('heading', {
        name: 'Reset password link damaged',
      });
      screen.getByText(
        'The link you clicked was missing characters, and may have been broken by your email client. Copy the address carefully, and try again.'
      );
    })
  });

  // TODO : check for metrics event when link is expired or damaged
  it('emits the expected metrics on render', () => {
    renderWithAccount(account);

    expect(logPageViewEvent).toHaveBeenCalledWith(
      'complete-reset-password',
      REACT_ENTRYPOINT
    );
  });

  it('displays any errors', async () => {
    account = {
      resetPasswordStatus: jest.fn().mockResolvedValue(true),
      completeResetPassword: jest
        .fn()
        .mockRejectedValue(new Error('Request failed')),
    } as unknown as Account;

    renderWithAccount(account);

    await act(async () => {
      fireEvent.input(screen.getByTestId('new-password-input-field'), {
        target: { value: PASSWORD },
      });
    });

    await act(async () => {
      fireEvent.input(screen.getByTestId('verify-password-input-field'), {
        target: { value: PASSWORD },
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Reset password'));
    });

    screen.getByText('Sorry, there was a problem setting your password');
  });

  it('can submit', async () => {
    renderWithAccount(account);

    await act(async () => {
      fireEvent.input(screen.getByTestId('new-password-input-field'), {
        target: { value: PASSWORD },
      });
    });

    await act(async () => {
      fireEvent.input(screen.getByTestId('verify-password-input-field'), {
        target: { value: PASSWORD },
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Reset password'));
    });

    expect(account.completeResetPassword).toHaveBeenCalledWith(
      mockToken,
      mockCode,
      mockEmail,
      PASSWORD
    );
    expect(mockNavigate).toHaveBeenCalledWith('/reset_password_verified', {
      replace: true,
    });
  });
});
