/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Subject } from './mocks';

const singleValue = 'ANMD 1S09 7Y2Y 4EES 02CW BJ6Z PYKP H69F';

Object.defineProperty(window.navigator, 'clipboard', {
  value: { writeText: jest.fn() },
});
window.URL.createObjectURL = jest.fn();

it('can render single values', () => {
  renderWithLocalizationProvider(<Subject />);
  expect(screen.getByText(singleValue)).toBeInTheDocument();
});

it('displays a tooltip on action', async () => {
  renderWithLocalizationProvider(<Subject value={singleValue} />);
  fireEvent.click(await screen.findByTestId('databutton-copy'));
  expect(
    await screen.findByTestId('datablock-copy-tooltip')
  ).toBeInTheDocument();
});
