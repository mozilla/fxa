/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { screen, waitFor } from '@testing-library/react';
import ResetPasswordWarning from '.';
import userEvent from '@testing-library/user-event';

describe('ResetPasswordWarning component', () => {
  it('renders as expected', async () => {
    renderWithLocalizationProvider(<ResetPasswordWarning />);

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
      screen.getByText('Have a device where you previously signed in?')
    ).toBeVisible();

    expect(
      screen.getByText(
        'Your browser data may be locally saved on that device. Sign in there with your new password to restore and sync.'
      )
    ).toBeVisible();

    expect(
      screen.getByText('Have a new device but don’t have your old one?')
    ).toBeVisible();

    expect(
      screen.getByText(
        'We’re sorry, but your encrypted browser data on Firefox servers can’t be recovered. However, you can still access your local data on any device where you have previously signed in.'
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

  it('renders as expected with mobile width', async () => {
    global.innerWidth = 375; // Set mobile width
    global.dispatchEvent(new Event('resize'));

    renderWithLocalizationProvider(<ResetPasswordWarning />);

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
      screen.queryByText('Have a device where you previously signed in?')
    ).not.toBeVisible();
  });

  it('handles click/toggle as expected', async () => {
    const user = userEvent.setup();
    global.innerWidth = 375; // Set mobile width
    global.dispatchEvent(new Event('resize'));

    renderWithLocalizationProvider(<ResetPasswordWarning />);

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
