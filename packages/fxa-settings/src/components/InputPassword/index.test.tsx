/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import InputPassword from '.';

const label = 'Top Notch';

it('renders as expected', () => {
  renderWithLocalizationProvider(<InputPassword {...{ label }} />);
  expect(screen.getByTestId('input-container')).toBeInTheDocument();
  expect(screen.getByTestId('input-label')).toBeInTheDocument();
  expect(screen.getByTestId('input-field')).toBeInTheDocument();
  expect(screen.getByTestId('input-label')).toHaveTextContent(label);
});

it('can be disabled', () => {
  renderWithLocalizationProvider(<InputPassword {...{ label }} disabled />);
  expect(screen.getByTestId('input-field')).toBeDisabled();
});

it('can have a default value', () => {
  const defaultValue = 'Myths Made Plain';
  renderWithLocalizationProvider(
    <InputPassword {...{ label, defaultValue }} />
  );
  expect(screen.getByTestId('input-field')).toHaveAttribute(
    'value',
    defaultValue
  );
});

it('can be toggled', () => {
  renderWithLocalizationProvider(<InputPassword {...{ label }} />);
  expect(screen.getByTestId('input-field')).toHaveAttribute('type', 'password');
  expect(screen.getByTestId('visibility-toggle')).toHaveAttribute(
    'aria-pressed',
    'false'
  );
  fireEvent.click(screen.getByTestId('visibility-toggle'));
  expect(screen.getByTestId('input-field')).toHaveAttribute('type', 'text');
  expect(screen.getByTestId('visibility-toggle')).toHaveAttribute(
    'aria-pressed',
    'true'
  );
});
