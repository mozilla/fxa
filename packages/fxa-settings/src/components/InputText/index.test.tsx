/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import InputText from '.';

const label = 'Eveything to Nothing';

it('renders as expected', () => {
  render(<InputText {...{ label }} />);
  expect(screen.getByTestId('input-container')).toBeInTheDocument();
  expect(screen.getByTestId('input-label')).toBeInTheDocument();
  expect(screen.getByTestId('input-field')).toBeInTheDocument();
  expect(screen.getByTestId('input-label')).toHaveTextContent(label);
});

it('can be disabled', () => {
  render(<InputText {...{ label }} disabled />);
  expect(screen.getByTestId('input-field')).toBeDisabled();
});

it('can have default text', () => {
  const defaultValue = 'Forest Whitaker';
  render(<InputText {...{ label, defaultValue }} />);
  expect(screen.getByTestId('input-field')).toHaveValue(defaultValue);
});

it('accepts various input types', () => {
  ['text', 'email', 'tel', 'number', 'url', 'password'].forEach((inputType) => {
    const type = inputType as
      | 'text'
      | 'email'
      | 'tel'
      | 'number'
      | 'url'
      | 'password';
    render(<InputText {...{ label, type }} />);
    expect(screen.getByTestId('input-field')).toHaveAttribute('type', type);
    // Cleanup because we want to find this element again within the same test
    cleanup();
  });
});

it('can render adjacent children', () => {
  render(
    <InputText {...{ label }}>
      <p data-testid="input-children">Hey</p>
    </InputText>
  );
  expect(screen.getByTestId('input-children')).toBeInTheDocument();
});
