/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import InputCheckboxBlue from '.';

it('renders as expected', () => {
  render(<InputCheckboxBlue />);
  screen.getByRole('checkbox');
});

it('can be checked by default', () => {
  render(<InputCheckboxBlue defaultChecked />);
  expect(screen.getByRole('checkbox')).toHaveAttribute('checked');
});

it('can be unchecked by default', () => {
  render(<InputCheckboxBlue />);
  expect(screen.getByRole('checkbox')).not.toHaveAttribute('checked');
});

it('can be disabled', () => {
  render(<InputCheckboxBlue disabled />);
  expect(screen.getByRole('checkbox')).toHaveAttribute('disabled');
});

it('can have a label', () => {
  const label = 'I am a label';
  render(<InputCheckboxBlue {...{ label }} />);
  expect(
    screen.getByRole('checkbox', { name: 'I am a label' })
  ).toBeInTheDocument();
});

it('will call onChange argument', () => {
  const onChange = jest.fn();
  render(<InputCheckboxBlue {...{ onChange }} />);
  fireEvent.click(screen.getByRole('checkbox'));
  expect(onChange).toBeCalled();
});
