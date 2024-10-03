/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { screen, waitFor } from '@testing-library/react';
import ResetPasswordWarning from '.';
import userEvent from '@testing-library/user-event';
import { createMockLocationState } from './mocks';

describe('ResetPasswordWarning component', () => {
  it('renders as expected when no recovery key exists', async () => {
    renderWithLocalizationProvider(
      <ResetPasswordWarning locationState={createMockLocationState(false)} />
    );

    expect(
      screen.getByRole('img', {
        name: 'Warning',
      })
    ).toBeVisible();

    expect(
      screen.getByText('Your browser data may not be recovered')
    ).toBeVisible();

    expect(screen.getByRole('img', { name: 'Collapse warning' })).toBeVisible();

    expect(
      screen.queryByText('Have an account recovery key?')
    ).not.toBeInTheDocument();

    expect(
      screen.getByText('Have any device where you previously signed in?')
    ).toBeVisible();

    expect(
      screen.getByText(
        'Your browser data might be saved on that device. Reset your password, then sign in there to restore and sync your data.'
      )
    ).toBeVisible();

    expect(
      screen.getByText(
        'Have a new device but don’t have access to any of your previous ones?'
      )
    ).toBeVisible();

    expect(
      screen.getByText(
        'We’re sorry, but your encrypted browser data on Firefox servers can’t be recovered.'
      )
    ).toBeVisible();

    expect(
      screen.getByRole('link', {
        name: 'Learn more about restoring account data',
      })
    ).toBeVisible();

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://support.mozilla.org/kb/how-reset-your-password-without-account-recovery-keys-access-data'
    );
  });

  it('renders additional message point when recovery key exists', async () => {
    renderWithLocalizationProvider(
      <ResetPasswordWarning locationState={createMockLocationState(true)} />
    );

    expect(screen.getByText('Have an account recovery key?')).toBeVisible();
    expect(
      screen.getByRole('link', {
        name: 'Use it now to reset your password and keep your data',
      })
    ).toBeVisible();
  });

  it('renders additional message point when recovery key status is undefined', async () => {
    renderWithLocalizationProvider(
      <ResetPasswordWarning locationState={createMockLocationState()} />
    );

    expect(screen.getByText('Have an account recovery key?')).toBeVisible();
  });

  it('renders as expected with mobile width', async () => {
    global.innerWidth = 375; // Set mobile width
    global.dispatchEvent(new Event('resize'));

    renderWithLocalizationProvider(
      <ResetPasswordWarning locationState={createMockLocationState(false)} />
    );

    expect(
      screen.getByRole('img', {
        name: 'Warning',
      })
    ).toBeVisible();

    expect(
      screen.getByText('Your browser data may not be recovered')
    ).toBeVisible();

    expect(screen.getByRole('img', { name: 'Expand warning' })).toBeVisible();

    expect(
      screen.queryByText('Have any device where you previously signed in?')
    ).not.toBeVisible();
  });

  it('handles click/toggle as expected', async () => {
    const user = userEvent.setup();
    global.innerWidth = 375; // Set mobile width
    global.dispatchEvent(new Event('resize'));

    renderWithLocalizationProvider(
      <ResetPasswordWarning locationState={createMockLocationState(false)} />
    );

    user.click(screen.getByRole('img', { name: 'Expand warning' }));

    await waitFor(() => {
      expect(screen.getByRole('group')).toHaveAttribute('open');
      expect(
        screen.getByRole('img', { name: 'Collapse warning' })
      ).toBeVisible();
      expect(
        screen.queryByRole('img', { name: 'Expand warning' })
      ).not.toBeInTheDocument();
    });

    user.click(screen.getByRole('img', { name: 'Collapse warning' }));

    await waitFor(() => {
      expect(screen.getByRole('group')).not.toHaveAttribute('open');
      expect(screen.getByRole('img', { name: 'Expand warning' })).toBeVisible();
      expect(
        screen.queryByRole('img', { name: 'Collapse warning' })
      ).not.toBeInTheDocument();
    });
  });
});
