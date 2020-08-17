/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DataBlock from './index';

const singleValue = 'ANMD 1S09 7Y2Y 4EES 02CW BJ6Z PYKP H69F';

const multiValue = [
  'C1OFZW7R04',
  'XVKRLKERT4',
  'CF0V94X204',
  'C3THX2SGZ4',
  'UXC6NRQT54',
  '24RF9WFA44',
  'ZBULPFN7J4',
  'D4J6KY8FL4',
];

Object.defineProperty(window.navigator, 'clipboard', {
  value: { writeText: jest.fn() },
});

it('can render single values', () => {
  render(<DataBlock value={singleValue} />);
  expect(screen.getByText(singleValue)).toBeInTheDocument();
});

it('can render multiple values', () => {
  render(<DataBlock value={multiValue} />);
  multiValue.forEach((value) => {
    expect(screen.getByText(value)).toBeInTheDocument();
  });
});

it('can copy a single value to the clipboard', () => {
  render(<DataBlock value={singleValue} copyable />);
  fireEvent.click(screen.getByTestId('datablock-button'));
  expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(
    singleValue
  );
});

it('can copy multiple values to the clipboard', () => {
  render(<DataBlock value={multiValue} copyable />);
  fireEvent.click(screen.getByTestId('datablock-button'));
  expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(
    multiValue.join(', ')
  );
});

it('can be a read-only (disabled) element', () => {
  render(<DataBlock value={singleValue} />);
  expect(screen.getByTestId('datablock-button')).toBeDisabled();
});

it('can have screen reader text', () => {
  const readerText = 'Born Of You';
  render(<DataBlock {...{ readerText }} value={singleValue} />);
  expect(screen.getByTestId('datablock-srtext')).toBeInTheDocument();
  expect(screen.getByTestId('datablock-srtext')).toHaveTextContent(readerText);
});
