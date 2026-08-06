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
import { MOCK_EMAIL, Subject } from './mocks';

const FTL_ARGS = {
  browserName: MOCK_DEVICE_FAMILY,
  deviceName: MOCK_DEVICE_NAME,
  city: MOCK_CITY,
  region: MOCK_REGION,
  country: MOCK_COUNTRY,
  ipAddress: MOCK_IP_ADDRESS,
};

// `testL10n` compares the bundle message against the element's text, so it
// can't check a message whose bundle text still carries the DOM-overlay tags
// that `elems` swaps for real elements. This one is checked tag-stripped below.
const CHANGE_PASSWORD_FTL_ID =
  'pair2-authority-approve-sign-in-change-password';

describe('Pair2/Authority/ApproveSignIn page', () => {
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
      .filter((el) => !el.textContent?.endsWith('.svg'))
      .filter((el) => el.id !== CHANGE_PASSWORD_FTL_ID);

    expect(messages.length).toBeGreaterThan(0);
    messages.forEach((el) => testL10n(el, bundle, FTL_ARGS));
  });

  it('renders the change password sentence with text matching the Fluent bundle', async () => {
    const bundle: FluentBundle = await getFtlBundle('settings');
    const message = bundle.getMessage(CHANGE_PASSWORD_FTL_ID);
    renderWithLocalizationProvider(<Subject />);

    const withoutOverlayTags = bundle
      .formatPattern(message!.value!)
      .replace(/<\/?changePassword>/g, '');

    expect(
      screen
        .getAllByTestId('ftlmsg-mock')
        .find((el) => el.id === CHANGE_PASSWORD_FTL_ID)
    ).toHaveTextContent(withoutOverlayTags);
  });

  it('renders the heading and the account email', () => {
    renderWithLocalizationProvider(<Subject />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Approve sign-in?'
    );
    screen.getByText(MOCK_EMAIL);
  });

  it('exposes the illustration to assistive technology', () => {
    renderWithLocalizationProvider(<Subject />);

    expect(
      screen
        .getAllByRole('img')
        .map((img) => img.getAttribute('alt') ?? img.getAttribute('aria-label'))
    ).toEqual([
      // AppLayout's page header, then the one image this card renders. Desktop
      // cards have no Firefox lockup.
      'Mozilla logo',
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

  it('calls onApprove when the approve button is clicked', async () => {
    const user = userEvent.setup();
    const onApprove = jest.fn();
    renderWithLocalizationProvider(<Subject {...{ onApprove }} />);

    await user.click(
      screen.getByRole('button', { name: 'Yes, approve sign in' })
    );

    expect(onApprove).toHaveBeenCalledTimes(1);
  });

  it('calls onChangePassword when the change password link is clicked', async () => {
    const user = userEvent.setup();
    const onChangePassword = jest.fn();
    renderWithLocalizationProvider(<Subject {...{ onChangePassword }} />);

    await user.click(
      screen.getByRole('button', { name: 'Change your password' })
    );

    expect(onChangePassword).toHaveBeenCalledTimes(1);
  });
});
