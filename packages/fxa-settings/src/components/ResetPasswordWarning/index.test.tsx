/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { screen, waitFor } from '@testing-library/react';
import ResetPasswordWarning from '.';
import userEvent from '@testing-library/user-event';
import { createMockLocationState } from './mocks';
import { MemoryRouter } from 'react-router';

describe('ResetPasswordWarning component', () => {
  it('renders as expected when no recovery key exists', async () => {
    renderWithLocalizationProvider(
      <MemoryRouter>
        <ResetPasswordWarning locationState={createMockLocationState(false)} />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('img', {
        name: 'Warning',
      })
    ).toBeVisible();

    expect(
      screen.getByText('Review sign-in options to keep browser data')
    ).toBeVisible();

    expect(screen.getByRole('img', { name: 'Collapse warning' })).toBeVisible();

    expect(
      screen.queryByText('Have an account recovery key?')
    ).not.toBeInTheDocument();

    expect(
      screen.getByText('Still signed in on another device?')
    ).toBeVisible();

    expect(
      screen.getByText(
        'Your browser data may be available. Reset your password, then sign in on that device to restore and sync your data.'
      )
    ).toBeVisible();

    expect(
      screen.getByText('Using a new device but can’t access your old ones?')
    ).toBeVisible();

    expect(
      screen.getByText(
        'After you reset your password, encrypted browser data on Firefox servers won’t be available on this device.'
      )
    ).toBeVisible();

    expect(
      screen.getByRole('link', {
        name: 'Learn how to restore browser data from a signed-in device',
      })
    ).toBeVisible();

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://support.mozilla.org/en-US/kb/how-change-or-reset-your-mozilla-account-password'
    );
  });

  it('renders additional message point when recovery key exists', async () => {
    renderWithLocalizationProvider(
      <MemoryRouter>
        <ResetPasswordWarning locationState={createMockLocationState(true)} />
      </MemoryRouter>
    );

    expect(screen.getByText('Have an account recovery key?')).toBeVisible();
    expect(
      screen.getByRole('link', {
        name: 'Use it to reset your password and keep your browser data',
      })
    ).toBeVisible();
  });

  it('renders additional message point when recovery key status is undefined', async () => {
    renderWithLocalizationProvider(
      <MemoryRouter>
        <ResetPasswordWarning locationState={createMockLocationState()} />
      </MemoryRouter>
    );

    expect(screen.getByText('Have an account recovery key?')).toBeVisible();
  });

  it('renders as expected with mobile width', async () => {
    global.innerWidth = 375; // Set mobile width
    global.dispatchEvent(new Event('resize'));

    renderWithLocalizationProvider(
      <MemoryRouter>
        <ResetPasswordWarning locationState={createMockLocationState(false)} />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('img', {
        name: 'Warning',
      })
    ).toBeVisible();

    expect(
      screen.getByText('Review sign-in options to keep browser data')
    ).toBeVisible();

    expect(screen.getByRole('img', { name: 'Expand warning' })).toBeVisible();

    expect(
      screen.queryByText('Still signed in on another device?')
    ).not.toBeVisible();
  });

  it('handles click/toggle as expected', async () => {
    const user = userEvent.setup();
    global.innerWidth = 375; // Set mobile width
    global.dispatchEvent(new Event('resize'));

    renderWithLocalizationProvider(
      <MemoryRouter>
        <ResetPasswordWarning locationState={createMockLocationState(false)} />
      </MemoryRouter>
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

  it('defaults to collapsed view if defaultClosed is true', async () => {
    renderWithLocalizationProvider(
      <MemoryRouter>
        <ResetPasswordWarning
          locationState={createMockLocationState(false)}
          defaultClosed
        />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('img', {
        name: 'Warning',
      })
    ).toBeVisible();

    expect(
      screen.getByText('Review sign-in options to keep browser data')
    ).toBeVisible();

    expect(screen.getByRole('img', { name: 'Expand warning' })).toBeVisible();

    expect(
      screen.getByText('Still signed in on another device?')
    ).not.toBeVisible();
  });
});
