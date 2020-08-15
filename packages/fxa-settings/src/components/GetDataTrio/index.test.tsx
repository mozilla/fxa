/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import GetDataTrio from './index';

const value = 'Sun Tea';
const url = 'https://mozilla.org';

it('renders as expected', () => {
  render(<GetDataTrio {...{ value, url }} />);
  expect(screen.getByTestId('databutton-download')).toBeInTheDocument();
  expect(screen.getByTestId('databutton-copy')).toBeInTheDocument();
  expect(screen.getByTestId('databutton-print')).toBeInTheDocument();
});
