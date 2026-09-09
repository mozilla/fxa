/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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

  describe('deviceNameDisplay', () => {
    it('folds the device name into the browser line when set to inline', () => {
      renderWithLocalizationProvider(
        <DeviceInfoBlock
          remoteMetadata={MOCK_METADATA_WITH_DEVICE_NAME}
          deviceNameDisplay="inline"
        />
      );

      screen.getByText('Firefox on Ultron');
      expect(
        screen.queryByRole('heading', { level: 2 })
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Firefox on macOS')).not.toBeInTheDocument();
    });

    it('omits the device name entirely when set to hidden', () => {
      renderWithLocalizationProvider(
        <DeviceInfoBlock
          remoteMetadata={MOCK_METADATA_WITH_DEVICE_NAME}
          deviceNameDisplay="hidden"
        />
      );

      screen.getByText('Firefox on macOS');
      expect(
        screen.queryByRole('heading', { level: 2 })
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Firefox on Ultron')).not.toBeInTheDocument();
    });

    // `pairing-authority-integration` leaves `deviceName` unset rather than
    // substituting a generic type, so `inline` has to degrade to the OS line.
    it('falls back to the OS line under inline when there is no device name', () => {
      renderWithLocalizationProvider(
        <DeviceInfoBlock
          remoteMetadata={MOCK_METADATA_WITH_LOCATION}
          deviceNameDisplay="inline"
        />
      );

      screen.getByText('Firefox on macOS');
    });
  });

  it('replaces the default wrapper classes when className is given', () => {
    const { container } = renderWithLocalizationProvider(
      <DeviceInfoBlock
        remoteMetadata={MOCK_METADATA_WITH_LOCATION}
        className="rounded-md border"
      />
    );

    expect(container.firstElementChild).toHaveClass('rounded-md', 'border');
    expect(container.firstElementChild).not.toHaveClass('mt-8', 'mb-4');
  });
});
