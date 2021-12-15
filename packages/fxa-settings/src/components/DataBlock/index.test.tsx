/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Account, AppContext } from '../../models';
import DataBlock from './index';
import { act } from 'react-dom/test-utils';

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

const account = {
  primaryEmail: {
    email: 'pbooth@mozilla.com',
  },
} as unknown as Account;

Object.defineProperty(window.navigator, 'clipboard', {
  value: { writeText: jest.fn() },
});
window.URL.createObjectURL = jest.fn();

it('can render single values', () => {
  render(
    <AppContext.Provider value={{ account }}>
      <DataBlock value={singleValue} />
    </AppContext.Provider>
  );
  expect(screen.getByText(singleValue)).toBeInTheDocument();
});

it('can render multiple values', () => {
  render(
    <AppContext.Provider value={{ account }}>
      <DataBlock value={multiValue} />
    </AppContext.Provider>
  );
  multiValue.forEach((value) => {
    expect(screen.getByText(value)).toBeInTheDocument();
  });
});

it('can apply spacing to multiple values', () => {
  render(
    <AppContext.Provider value={{ account }}>
      <DataBlock value={multiValue} separator=" " />
    </AppContext.Provider>
  );

  expect(screen.getByTestId('datablock').textContent?.trim()).toEqual(
    multiValue.join(' ')
  );
});

it('displays a tooltip on action', async () => {
  render(
    <AppContext.Provider value={{ account }}>
      <DataBlock value={multiValue} />
    </AppContext.Provider>
  );
  await act(async () => {
    fireEvent.click(await screen.findByTestId('databutton-copy'));
  });
  expect(
    await screen.findByTestId('datablock-copy-tooltip')
  ).toBeInTheDocument();
});
