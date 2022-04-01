/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

it('renders without imploding', () => {
  const user = { user: { email: 'test', group: 'test', permissions: {} } };
  const { queryByTestId } = render(<App {...user} />);
  expect(queryByTestId('app')).toBeInTheDocument();
});
