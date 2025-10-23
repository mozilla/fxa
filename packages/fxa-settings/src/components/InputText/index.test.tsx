/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { cleanup, screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import InputText from '.';

const label = 'Eveything to Nothing';

it('renders as expected', () => {
  const { container } = renderWithLocalizationProvider(
    <InputText {...{ label }} />
  );
  expect(screen.getByTestId('input-container')).toBeInTheDocument();
  expect(screen.getByTestId('input-label')).toBeInTheDocument();
  expect(screen.getByTestId('input-field')).toBeInTheDocument();
  expect(screen.getByTestId('input-label')).toHaveTextContent(label);
  expect(container).toMatchSnapshot();
});

it('can be disabled', () => {
  renderWithLocalizationProvider(<InputText {...{ label }} disabled />);
  expect(screen.getByTestId('input-field')).toBeDisabled();
});

it('can have default text', () => {
  const defaultValue = 'Forest Whitaker';
  renderWithLocalizationProvider(<InputText {...{ label, defaultValue }} />);
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
    renderWithLocalizationProvider(<InputText {...{ label, type }} />);
    expect(screen.getByTestId('input-field')).toHaveAttribute('type', type);
    // Cleanup because we want to find this element again within the same test
    cleanup();
  });
});

it('can render adjacent children', () => {
  renderWithLocalizationProvider(
    <InputText {...{ label }}>
      <p data-testid="input-children">Hey</p>
    </InputText>
  );
  expect(screen.getByTestId('input-children')).toBeInTheDocument();
});
