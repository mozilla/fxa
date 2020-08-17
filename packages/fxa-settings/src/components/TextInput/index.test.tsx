/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import TextInput from './index';

const label = 'Eveything to Nothing';

it('renders as expected', () => {
  render(<TextInput {...{ label }} />);
  expect(screen.getByTestId('input-container')).toBeInTheDocument();
  expect(screen.getByTestId('input-label')).toBeInTheDocument();
  expect(screen.getByTestId('input-field')).toBeInTheDocument();
  expect(screen.getByTestId('input-label')).toHaveTextContent(label);
});

it('can be disabled', () => {
  render(<TextInput {...{ label }} disabled />);
  expect(screen.getByTestId('input-field')).toBeDisabled();
});

it('can have default text', () => {
  const defaultValue = 'Forest Whitaker';
  render(<TextInput {...{ label, defaultValue }} />);
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
    render(<TextInput {...{ label, type }} />);
    expect(screen.getByTestId('input-field')).toHaveAttribute('type', type);
    // Cleanup because we want to find this element again within the same test
    cleanup();
  });
});

it('can have screen reader text', () => {
  const readerText = 'Never Really Been Another Way Out';
  render(<TextInput {...{ label, readerText }} />);
  expect(screen.getByTestId('input-srtext')).toBeInTheDocument();
  expect(screen.getByTestId('input-srtext')).toHaveTextContent(readerText);
});

it('accepts a custom id', () => {
  const id = 'h6fcK_fRYaI';
  render(<TextInput {...{ label, id }} />);
  expect(screen.getByTestId('input-field')).toHaveAttribute('id', id);
  expect(screen.getByTestId('input-label')).toHaveAttribute('for', id);
});

it('creates a random id if one is not supplied', () => {
  render(<TextInput {...{ label }} />);
  const id = screen.getByTestId('input-field').getAttribute('id');
  expect(screen.getByTestId('input-label')).toHaveAttribute('for', id);
});

it('can have extra content', () => {
  render(
    <TextInput {...{ label }}>
      <p data-testid="input-children">Hey</p>
    </TextInput>
  );
  expect(screen.getByTestId('input-children')).toBeInTheDocument();
});
