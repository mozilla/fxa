/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { mockAppContext, renderWithRouter } from '../../../models/mocks';
import { AppContext, AlertBarInfo } from '../../../models';
import CompleteResetPassword from '.';
import { usePageViewEvent } from '../../../lib/metrics';
import { MOCK_ACCOUNT } from '../../../models/mocks';
import { SHOW_BALLOON_TIMEOUT } from '../../../constants';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';

jest.mock('../../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

const alertBarInfo = {
  success: jest.fn(),
  error: jest.fn(),
} as unknown as AlertBarInfo;

describe('CompleteResetPassword page', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders the component as expected when the link is valid', () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ alertBarInfo })}>
        <CompleteResetPassword
          email={MOCK_ACCOUNT.primaryEmail.email}
          linkStatus="valid"
        />
      </AppContext.Provider>
    );
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
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ alertBarInfo })}>
        <CompleteResetPassword
          email={MOCK_ACCOUNT.primaryEmail.email}
          linkStatus="valid"
        />
      </AppContext.Provider>
    );
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

  it('renders the component as expected when provided with an expired link', () => {
    render(
      <CompleteResetPassword
        email={MOCK_ACCOUNT.primaryEmail.email}
        linkStatus="expired"
      />
    );

    screen.getByRole('heading', {
      name: 'Reset password link expired',
    });
    screen.getByText('The link you clicked to reset your password is expired.');
    screen.getByRole('button', {
      name: 'Receive new link',
    });

    // Components that should not be rendered when the link is expired
  });

  it('renders the component as expected when provided with a damaged link', () => {
    render(
      <CompleteResetPassword
        email={MOCK_ACCOUNT.primaryEmail.email}
        linkStatus="damaged"
      />
    );

    screen.getByRole('heading', {
      name: 'Reset password link damaged',
    });
    screen.getByText(
      'The link you clicked was missing characters, and may have been broken by your email client. Copy the address carefully, and try again.'
    );
  });

  // TODO : check for metrics event when link is expired or damaged
  it('emits the expected metrics on render when the link is valid', () => {
    render(
      <CompleteResetPassword
        email={MOCK_ACCOUNT.primaryEmail.email}
        linkStatus="valid"
      />
    );
    expect(usePageViewEvent).toHaveBeenCalledWith('complete-reset-password', {
      entrypoint_variation: 'react',
    });
  });
});
