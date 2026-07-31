/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FluentBundle } from '@fluent/bundle';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import ConnectThisDevice, { ConnectThisDeviceProps } from '.';
import {
  MOCK_AUTH_DEVICE_INFO,
  MOCK_AUTH_DEVICE_INFO_UNKNOWN_LOCATION,
  MOCK_EMAIL,
} from './mocks';

function renderCard(props?: Partial<ConnectThisDeviceProps>) {
  return renderWithLocalizationProvider(
    <ConnectThisDevice
      email={MOCK_EMAIL}
      authDeviceInfo={MOCK_AUTH_DEVICE_INFO}
      {...props}
    />
  );
}

describe('ConnectThisDevice', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });

  // `testAllL10n` only walks elements rendered through `FtlMsg`. The two alt
  // texts go through `ftlMsgResolver.getMsg(id, fallback)`, which silently
  // returns the English fallback for a missing or typo'd id — so a broken id
  // would pass every other assertion in this file. Check the bundle directly.
  it.each([
    'pair-connect-device-firefox-logo-alt',
    'pair-connect-device-image-alt',
  ])('has %s in the Fluent bundle', (ftlId) => {
    expect(bundle.getMessage(ftlId)).toBeDefined();
  });

  it('has every Fluent id in the bundle, with matching fallback copy', () => {
    renderCard();
    // Args cover the nested DeviceInfoBlock messages as well as this card's own.
    testAllL10n(screen, bundle, {
      browserName: MOCK_AUTH_DEVICE_INFO.deviceFamily,
      genericOSName: MOCK_AUTH_DEVICE_INFO.deviceOS,
      ipAddress: MOCK_AUTH_DEVICE_INFO.ipAddress,
      city: MOCK_AUTH_DEVICE_INFO.city!,
      region: MOCK_AUTH_DEVICE_INFO.region!,
      country: MOCK_AUTH_DEVICE_INFO.country!,
    });
  });

  it('renders the heading', () => {
    renderCard();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Connect this device to your account?',
      })
    ).toBeInTheDocument();
  });

  it('renders the account email', () => {
    renderCard();
    expect(screen.getByText(MOCK_EMAIL)).toBeInTheDocument();
  });

  it('renders the browser, location, and IP address of the pairing device', () => {
    renderCard();
    expect(screen.getByText('Firefox on macOS')).toBeInTheDocument();
    expect(
      screen.getByText('Portland, Oregon, United States (estimated)')
    ).toBeInTheDocument();
    expect(screen.getByText('IP address: 71.25.467.347')).toBeInTheDocument();
  });

  it('renders "Location unknown" when the pairing device has no location', () => {
    renderCard({ authDeviceInfo: MOCK_AUTH_DEVICE_INFO_UNKNOWN_LOCATION });
    expect(screen.getByText('Location unknown')).toBeInTheDocument();
  });

  it('omits the device name, which the card design does not show', () => {
    renderCard();
    expect(
      screen.queryByRole('heading', { name: MOCK_AUTH_DEVICE_INFO.deviceName })
    ).not.toBeInTheDocument();
  });

  it('renders the brand logo and sync illustration with accessible names', () => {
    renderCard();
    expect(screen.getByRole('img', { name: 'Firefox' })).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: /A desktop browser window and a mobile phone/,
      })
    ).toBeInTheDocument();
  });

  it('calls onConnect when the Connect button is clicked', async () => {
    const user = userEvent.setup();
    const onConnect = jest.fn();
    renderCard({ onConnect });

    await user.click(screen.getByRole('button', { name: 'Connect' }));

    expect(onConnect).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when the Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    renderCard({ onCancel });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
