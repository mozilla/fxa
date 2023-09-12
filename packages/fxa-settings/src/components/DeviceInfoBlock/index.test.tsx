/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import DeviceInfoBlock from '.';
import {
  MOCK_METADATA_UNKNOWN_LOCATION,
  MOCK_METADATA_WITH_DEVICE_NAME,
  MOCK_METADATA_WITH_LOCATION,
} from './mocks';

describe('DeviceInfoBlock component', () => {
  it('renders as expected when the location is undefined', () => {
    renderWithLocalizationProvider(
      <DeviceInfoBlock remoteMetadata={MOCK_METADATA_UNKNOWN_LOCATION} />
    );

    screen.getByText('Firefox on macOS');
    screen.getByText('Location unknown');
    screen.getByText('IP address: XX.XX.XXX.XXX');
  });

  it('renders as expected when a device name is provided', () => {
    renderWithLocalizationProvider(
      <DeviceInfoBlock remoteMetadata={MOCK_METADATA_WITH_DEVICE_NAME} />
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Ultron'
    );
  });

  it('renders as expected when a location is available', () => {
    renderWithLocalizationProvider(
      <DeviceInfoBlock remoteMetadata={MOCK_METADATA_WITH_LOCATION} />
    );

    screen.getByText('Vancouver, British Columbia, Canada (estimated)');
  });
});
