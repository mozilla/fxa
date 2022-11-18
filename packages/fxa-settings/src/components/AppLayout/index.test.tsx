/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import AppLayout from '.';

it('renders as expected with children', async () => {
  render(
    <AppLayout>
      <p>Hello, world!</p>
    </AppLayout>
  );

  expect(screen.getByTestId('app')).toBeInTheDocument();
  screen.getByText('Hello, world!');
  screen.getByRole('main');

  const mozLink = screen.getByRole('link');
  expect(mozLink).toHaveAttribute('rel', 'author');
  expect(mozLink).toHaveAttribute(
    'href',
    'https://www.mozilla.org/about/?utm_source=firefox-accounts&utm_medium=Referral'
  );
  screen.getByAltText('Mozilla logo');
});
