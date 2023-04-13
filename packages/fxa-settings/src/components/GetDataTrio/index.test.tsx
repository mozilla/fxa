/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Account, AppContext } from '../../models';
import GetDataTrio from './index';
import { MOCK_ACCOUNT } from '../../models/mocks';

const contentType = 'Firefox account recovery key';
const value = 'Sun Tea';
const url = 'https://mozilla.org';

const account = { ...MOCK_ACCOUNT } as unknown as Account;

it('renders Trio as expected', () => {
  window.URL.createObjectURL = jest.fn();
  render(
    <AppContext.Provider value={{ account }}>
      <GetDataTrio {...{ value, contentType, url }} />
    </AppContext.Provider>
  );
  expect(screen.getByTestId('databutton-download')).toBeInTheDocument();
  expect(screen.getByTestId('databutton-download')).toHaveAttribute(
    'download',
    expect.stringMatching(contentType)
  );
  expect(screen.getByTestId('databutton-copy')).toBeInTheDocument();
  expect(screen.getByTestId('databutton-print')).toBeInTheDocument();
});

it('renders single Copy button as expected', () => {
  window.URL.createObjectURL = jest.fn();
  render(
    <AppContext.Provider value={{ account }}>
      <GetDataTrio {...{ value, contentType, url }} />
    </AppContext.Provider>
  );
  expect(screen.getByTestId('databutton-copy')).toBeInTheDocument();
});
