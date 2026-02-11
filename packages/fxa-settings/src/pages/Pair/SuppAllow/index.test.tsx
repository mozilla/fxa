/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import SuppAllow from '.';
import {
  MOCK_METADATA_UNKNOWN_LOCATION,
  MOCK_METADATA_WITH_DEVICE_NAME,
  MOCK_METADATA_WITH_LOCATION,
} from '../../../components/DeviceInfoBlock/mocks';
import { MOCK_ACCOUNT } from '../../../models/mocks';
import { usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

const MOCK_EMAIL = MOCK_ACCOUNT.primaryEmail.email;

describe('Pair/SuppAllow page', () => {
  // TODO: enable l10n tests when FXA-6461 is resolved (handle embedded tags)
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });
  it('renders as expected when the location is undefined', () => {
    renderWithLocalizationProvider(
      <SuppAllow
        email={MOCK_EMAIL}
        authDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
      />
    );
    // testAllL10n(screen, bundle, {email:MOCK_EMAIL});

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Confirm pairing for johndope@example.com'
    );
    screen.getByText('Firefox on macOS');
    screen.getByText('Location unknown');
    screen.getByText('IP address: XX.XX.XXX.XXX');
  });

  it('renders as expected when a device name is provided', () => {
    renderWithLocalizationProvider(
      <SuppAllow
        email={MOCK_EMAIL}
        authDeviceInfo={MOCK_METADATA_WITH_DEVICE_NAME}
      />
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Ultron'
    );
  });

  it('renders as expected when a location is available', () => {
    renderWithLocalizationProvider(
      <SuppAllow
        email={MOCK_EMAIL}
        authDeviceInfo={MOCK_METADATA_WITH_LOCATION}
      />
    );

    screen.getByText('Vancouver, British Columbia, Canada (estimated)');
  });

  it('emits the expected metrics event on render', () => {
    renderWithLocalizationProvider(
      <SuppAllow
        email={MOCK_EMAIL}
        authDeviceInfo={MOCK_METADATA_WITH_DEVICE_NAME}
      />
    );

    expect(usePageViewEvent).toHaveBeenCalledWith(
      'pair.supp.allow',
      REACT_ENTRYPOINT
    );
  });
});
