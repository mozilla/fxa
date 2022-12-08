/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InputPassword from '.';

const label = 'Top Notch';

it('renders as expected', () => {
  render(<InputPassword {...{ label }} />);
  expect(screen.getByTestId('input-container')).toBeInTheDocument();
  expect(screen.getByTestId('input-label')).toBeInTheDocument();
  expect(screen.getByTestId('input-field')).toBeInTheDocument();
  expect(screen.getByTestId('input-label')).toHaveTextContent(label);
});

it('can be disabled', () => {
  render(<InputPassword {...{ label }} disabled />);
  expect(screen.getByTestId('input-field')).toBeDisabled();
});

it('can have a default value', () => {
  const defaultValue = 'Myths Made Plain';
  render(<InputPassword {...{ label, defaultValue }} />);
  expect(screen.getByTestId('input-field')).toHaveAttribute(
    'value',
    defaultValue
  );
});

it('can be toggled', () => {
  render(<InputPassword {...{ label }} />);
  expect(screen.getByTestId('input-field')).toHaveAttribute('type', 'password');
  fireEvent.click(screen.getByTestId('visibility-toggle'));
  expect(screen.getByTestId('input-field')).toHaveAttribute('type', 'text');
});
