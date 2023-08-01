/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Account, AppContext } from '../../models';
import GetDataTrio from './index';
import { MOCK_ACCOUNT } from '../../models/mocks';

const contentType = 'Firefox account recovery key';
const value = 'Sun Tea';
const url = 'https://mozilla.org';

const account = { ...MOCK_ACCOUNT } as unknown as Account;
const setTooltipVisible = jest.fn();

it('renders Trio as expected', () => {
  window.URL.createObjectURL = jest.fn();
  renderWithLocalizationProvider(
    <AppContext.Provider value={{ account }}>
      <GetDataTrio {...{ value, contentType, url, setTooltipVisible }} />
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
  renderWithLocalizationProvider(
    <AppContext.Provider value={{ account }}>
      <GetDataTrio {...{ value, contentType, url, setTooltipVisible }} />
    </AppContext.Provider>
  );
  expect(screen.getByTestId('databutton-copy')).toBeInTheDocument();
});
