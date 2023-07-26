/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import InputCheckboxBlue from '.';

it('renders as expected', () => {
  renderWithLocalizationProvider(<InputCheckboxBlue />);
  screen.getByRole('checkbox');
});

it('can be checked by default', () => {
  renderWithLocalizationProvider(<InputCheckboxBlue defaultChecked />);
  expect(screen.getByRole('checkbox')).toHaveAttribute('checked');
});

it('can be unchecked by default', () => {
  renderWithLocalizationProvider(<InputCheckboxBlue />);
  expect(screen.getByRole('checkbox')).not.toHaveAttribute('checked');
});

it('can be disabled', () => {
  renderWithLocalizationProvider(<InputCheckboxBlue disabled />);
  expect(screen.getByRole('checkbox')).toHaveAttribute('disabled');
});

it('can have a label', () => {
  const label = 'I am a label';
  renderWithLocalizationProvider(<InputCheckboxBlue {...{ label }} />);
  expect(
    screen.getByRole('checkbox', { name: 'I am a label' })
  ).toBeInTheDocument();
});

it('will call onChange argument', () => {
  const onChange = jest.fn();
  renderWithLocalizationProvider(<InputCheckboxBlue {...{ onChange }} />);
  fireEvent.click(screen.getByRole('checkbox'));
  expect(onChange).toBeCalled();
});
