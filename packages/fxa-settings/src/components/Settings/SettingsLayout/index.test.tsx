/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor, within } from '@testing-library/react';
import { mockAppContext, renderWithRouter } from '../../../models/mocks';
import { getDefault } from '../../../lib/config';
import { SETTINGS_PATH } from '../../../constants';
import SettingsLayout from '.';

it('renders the app with children', async () => {
  const { router } = renderWithRouter(
    <SettingsLayout>
      <p data-testid="test-child">Hello, world!</p>
    </SettingsLayout>
  );

  await waitFor(() => {
    router.navigate(SETTINGS_PATH);
  });

  expect(screen.getByTestId('app')).toBeInTheDocument();
  expect(screen.getByTestId('content-skip')).toBeInTheDocument();
  expect(screen.getByTestId('header')).toBeInTheDocument();
  expect(screen.getByTestId('footer')).toBeInTheDocument();
  expect(screen.getByTestId('main')).toBeInTheDocument();
  expect(screen.getByTestId('main')).toContainElement(
    screen.getByTestId('test-child')
  );
});

it('renders the unified footer with the Help link when the flag is on', () => {
  const config = getDefault();
  renderWithRouter(
    <SettingsLayout>
      <p>Hello, world!</p>
    </SettingsLayout>,
    {},
    mockAppContext({
      config: {
        ...config,
        featureFlags: { ...config.featureFlags, unifiedFooter: true },
      },
    })
  );

  expect(
    within(screen.getByRole('contentinfo')).getByRole('link', {
      name: /Help/,
    })
  ).toHaveAttribute(
    'href',
    'https://support.mozilla.org/products/mozilla-account'
  );
});
