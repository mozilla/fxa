/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../../models/mocks';
import { HomePath } from '../../../constants';
import { MockSettingsAppLayout } from './mocks';

it('renders the app with children', async () => {
  const {
    history: { navigate },
  } = renderWithRouter(
    <MockSettingsAppLayout>
      <p data-testid="test-child">Hello, world!</p>
    </MockSettingsAppLayout>
  );
  await navigate(HomePath);
  expect(screen.getByTestId('app')).toBeInTheDocument();
  expect(screen.getByTestId('content-skip')).toBeInTheDocument();
  expect(screen.getByTestId('header')).toBeInTheDocument();
  expect(screen.getByTestId('footer')).toBeInTheDocument();
  expect(screen.getByTestId('main')).toBeInTheDocument();
  expect(screen.getByTestId('main')).toContainElement(
    screen.getByTestId('test-child')
  );
});
