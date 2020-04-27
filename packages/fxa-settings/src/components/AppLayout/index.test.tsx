/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AppLayout from '.';

it('renders the children', () => {
  const rendered = render(
    <AppLayout>
      <p data-testid="test-child">Hello, world!</p>
    </AppLayout>
  );

  expect(rendered.getByTestId('test-child')).toBeInTheDocument();
});
