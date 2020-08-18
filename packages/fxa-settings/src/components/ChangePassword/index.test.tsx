/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import ChangePassword from './index';
import { renderWithRouter } from '../../models/_mocks';

it('renders', async () => {
  renderWithRouter(<ChangePassword />);
  expect(screen.getByTestId('flow-container')).toBeInTheDocument();
  expect(screen.getByTestId('flow-container-back-btn')).toBeInTheDocument();
  expect(screen.getByTestId('nav-link-common-passwords')).toBeInTheDocument();
  expect(screen.getByTestId('nav-link-reset-password')).toBeInTheDocument();
});
