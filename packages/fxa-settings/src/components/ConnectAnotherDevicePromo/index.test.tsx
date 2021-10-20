/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import ConnectAnotherDevicePromo from '.';
import { renderWithRouter } from '../../models/mocks';

describe('Connect another device Promo', () => {
  it('renders "fresh load" <ConnectAnotherDevicePromo/> with correct content', async () => {
    renderWithRouter(<ConnectAnotherDevicePromo />);

    expect(
      await screen.findByText('Get Firefox on mobile or tablet')
    ).toBeTruthy();
    expect(await screen.findByTestId('download-link')).toHaveAttribute(
      'href',
      'https://www.mozilla.org/en-US/firefox/mobile/'
    );
    expect(await screen.findByTestId('play-store-link')).toHaveAttribute(
      'href',
      'https://app.adjust.com/2uo1qc?redirect=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dorg.mozilla.firefox'
    );
    expect(await screen.findByTestId('app-store-link')).toHaveAttribute(
      'href',
      'https://app.adjust.com/2uo1qc?redirect=https%3A%2F%2Fitunes.apple.com%2Fus%2Fapp%2Ffirefox-private-safe-browser%2Fid989804926'
    );
  });
});
