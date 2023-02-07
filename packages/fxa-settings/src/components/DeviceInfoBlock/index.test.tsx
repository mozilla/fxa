/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import DeviceInfoBlock from '.';
import {
  MOCK_DEVICE_NAME,
  MOCK_BROWSER_NAME,
  MOCK_OS_NAME,
  MOCK_IP_ADDRESS,
  MOCK_CITY,
  MOCK_REGION,
  MOCK_COUNTRY,
} from './mocks';

describe('DeviceInfoBlock component', () => {
  it('renders as expected when the location is undefined', () => {
    render(
      <DeviceInfoBlock
        browserName={MOCK_BROWSER_NAME}
        genericOSName={MOCK_OS_NAME}
        ipAddress={MOCK_IP_ADDRESS}
      />
    );

    screen.getByText('Firefox on macOS');
    screen.getByText('Location unknown');
    screen.getByText('IP address: XX.XX.XXX.XXX');
  });

  it('renders as expected when a device name is provided', () => {
    render(
      <DeviceInfoBlock
        browserName={MOCK_BROWSER_NAME}
        genericOSName={MOCK_OS_NAME}
        ipAddress={MOCK_IP_ADDRESS}
        deviceName={MOCK_DEVICE_NAME}
      />
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Ultron'
    );
  });

  it('renders as expected when a location is available', () => {
    render(
      <DeviceInfoBlock
        browserName={MOCK_BROWSER_NAME}
        genericOSName={MOCK_OS_NAME}
        ipAddress={MOCK_IP_ADDRESS}
        city={MOCK_CITY}
        region={MOCK_REGION}
        country={MOCK_COUNTRY}
      />
    );

    screen.getByText('Vancouver, British Columbia, Canada (estimated)');
  });
});
