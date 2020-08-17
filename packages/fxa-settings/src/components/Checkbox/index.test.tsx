/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import Checkbox from './index';

it('renders as expected', () => {
  render(<Checkbox />);
  expect(screen.getByTestId('checkbox-container')).toBeInTheDocument();
  expect(screen.getByTestId('checkbox-input')).toBeInTheDocument();
});

it('can be default checked', () => {
  render(<Checkbox defaultChecked />);
  expect(screen.getByTestId('checkbox-input')).toHaveAttribute('checked');
});

it('can be default unchecked', () => {
  render(<Checkbox />);
  expect(screen.getByTestId('checkbox-input')).not.toHaveAttribute('checked');
});

it('can be disabled', () => {
  render(<Checkbox disabled />);
  expect(screen.getByTestId('checkbox-input')).toHaveAttribute('disabled');
});

it('can have a label', () => {
  const label = 'Jimmy, He Whispers';
  render(<Checkbox {...{ label }} />);
  expect(screen.getByTestId('checkbox-label')).toBeInTheDocument();
  expect(screen.getByTestId('checkbox-label')).toHaveTextContent(label);
});
