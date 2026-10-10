/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FluentBundle } from '@fluent/bundle';
import { getFtlBundle, testL10n } from 'fxa-react/lib/test-utils';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import {
  MOCK_CITY,
  MOCK_COUNTRY,
  MOCK_DEVICE_FAMILY,
  MOCK_DEVICE_NAME,
  MOCK_IP_ADDRESS,
  MOCK_REGION,
} from '../../../../components/DeviceInfoBlock/mocks';
import { Subject } from './mocks';

const FTL_ARGS = {
  browserName: MOCK_DEVICE_FAMILY,
  deviceName: MOCK_DEVICE_NAME,
  city: MOCK_CITY,
  region: MOCK_REGION,
  country: MOCK_COUNTRY,
  ipAddress: MOCK_IP_ADDRESS,
};

describe('Pair2/Supplicant/ApproveSignIn page', () => {
  // Guards against drift between the fallback text in the component and the
  // actual Fluent bundle — including a rename of the `device-info-*` ids that
  // DeviceInfoBlock owns.
  it('renders every message with text matching the Fluent bundle', async () => {
    const bundle: FluentBundle = await getFtlBundle('settings');
    renderWithLocalizationProvider(<Subject />);

    const messages = screen
      .getAllByTestId('ftlmsg-mock')
      // The jest SVG stub renders the file name as the element's text, so image
      // messages can never match. Covered by components/images/index.test.tsx.
      .filter((el) => !el.textContent?.endsWith('.svg'));

    expect(messages.length).toBeGreaterThan(0);
    messages.forEach((el) => testL10n(el, bundle, FTL_ARGS));
  });

  it('renders the heading and instruction', () => {
    renderWithLocalizationProvider(<Subject />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'One last step to sync'
    );
    screen.getByText('Approve the sign-in on your computer.');
  });

  it('exposes the brand lockup and illustration to assistive technology', () => {
    renderWithLocalizationProvider(<Subject />);

    expect(
      screen
        .getAllByRole('img')
        .map((img) => img.getAttribute('alt') ?? img.getAttribute('aria-label'))
    ).toEqual([
      // AppLayout's page header, then the two images this card renders.
      'Mozilla logo',
      'Firefox logo',
      'A desktop browser window and a mobile phone, both syncing, with the Firefox mascot alongside them',
    ]);
  });

  it('renders the device info block with the device name inline', () => {
    renderWithLocalizationProvider(<Subject />);

    screen.getByText('Firefox on Ultron');
    screen.getByText('Vancouver, British Columbia, Canada (estimated)');
    screen.getByText('IP address: XX.XX.XXX.XXX');
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    renderWithLocalizationProvider(<Subject {...{ onCancel }} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders the card on a white page background', () => {
    renderWithLocalizationProvider(<Subject />);

    // Below `mobileLandscape` the card is transparent, so the page colour is
    // the colour the phone shows. The designs call for white, not the default
    // grey the desktop cards sit on.
    expect(screen.getByTestId('app')).toHaveClass('bg-white');
  });
});
