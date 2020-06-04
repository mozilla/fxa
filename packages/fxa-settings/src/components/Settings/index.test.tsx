/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import Settings from './index';
import { MOCK_ACCOUNT } from '../AccountDataHOC/mocks';

it('renders without imploding', async () => {
  render(<Settings account={MOCK_ACCOUNT} />);
  expect(screen.getByTestId('settings-profile')).toBeInTheDocument();
});
