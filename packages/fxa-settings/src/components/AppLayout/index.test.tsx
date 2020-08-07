/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render } from '@testing-library/react';
import { MockedCache } from '../../models/_mocks';
import AppLayout from '.';

it('renders the app with children', () => {
  const { getByTestId } = render(
    <MockedCache>
      <AppLayout>
        <p data-testid="test-child">Hello, world!</p>
      </AppLayout>
    </MockedCache>
  );
  expect(getByTestId('app')).toBeInTheDocument();
  expect(getByTestId('content-skip')).toBeInTheDocument();
  expect(getByTestId('header')).toBeInTheDocument();
  expect(getByTestId('footer')).toBeInTheDocument();
  expect(getByTestId('nav')).toBeInTheDocument();
  expect(getByTestId('main')).toBeInTheDocument();
  expect(getByTestId('main')).toContainElement(getByTestId('test-child'));
});
