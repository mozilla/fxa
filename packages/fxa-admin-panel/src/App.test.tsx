/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import { mockConfigBuilder } from './lib/config';
import { PermissionLevel } from 'fxa-shared/guards';

it('renders without imploding', () => {
  const config = mockConfigBuilder({
    user: {
      email: 'hello@mozilla.com',
      group: {
        name: 'Admin',
        level: PermissionLevel.Admin,
      },
    },
  });
  const { queryByTestId } = render(<App {...{ config }} />);
  expect(queryByTestId('app')).toBeInTheDocument();
});
