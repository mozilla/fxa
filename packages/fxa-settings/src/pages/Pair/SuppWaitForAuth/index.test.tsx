/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import SuppWaitForAuth, { viewName } from '.';
import {
  MOCK_METADATA_UNKNOWN_LOCATION,
  MOCK_METADATA_WITH_DEVICE_NAME,
  MOCK_METADATA_WITH_LOCATION,
} from '../../../components/DeviceInfoBlock/mocks';
import { usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

describe('SuppWaitForAuth page', () => {
  it('renders as expected when the location is undefined', () => {
    renderWithLocalizationProvider(
      <SuppWaitForAuth authDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION} />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Approval now required from your other device'
    );
    screen.getByText('Firefox on macOS');
    screen.getByText('Location unknown');
    screen.getByText('IP address: XX.XX.XXX.XXX');
  });

  it('renders as expected when a device name is provided', () => {
    renderWithLocalizationProvider(
      <SuppWaitForAuth authDeviceInfo={MOCK_METADATA_WITH_DEVICE_NAME} />
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Ultron'
    );
  });

  it('renders as expected when a location is available', () => {
    renderWithLocalizationProvider(
      <SuppWaitForAuth authDeviceInfo={MOCK_METADATA_WITH_LOCATION} />
    );

    screen.getByText('Vancouver, British Columbia, Canada (estimated)');
  });

  it('emits expected metrics events on render', () => {
    renderWithLocalizationProvider(
      <SuppWaitForAuth authDeviceInfo={MOCK_METADATA_WITH_LOCATION} />
    );

    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });
});
