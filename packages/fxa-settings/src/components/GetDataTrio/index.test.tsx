/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import GetDataTrio from './index';
import { MOCK_EMAIL } from '../../pages/mocks';

const contentType = 'Firefox account recovery key';
const value = 'Sun Tea';
const url = 'https://mozilla.org';

const setTooltipVisible = jest.fn();

it('renders Trio as expected', () => {
  window.URL.createObjectURL = jest.fn();
  renderWithLocalizationProvider(
    <GetDataTrio
      {...{ value, contentType, url, setTooltipVisible }}
      email={MOCK_EMAIL}
    />
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
    <GetDataTrio
      {...{ value, contentType, url, setTooltipVisible }}
      email={MOCK_EMAIL}
    />
  );
  expect(screen.getByTestId('databutton-copy')).toBeInTheDocument();
});
