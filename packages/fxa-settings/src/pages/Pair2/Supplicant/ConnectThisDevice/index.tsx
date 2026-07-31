/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../../../components/AppLayout';
import DeviceInfoBlock from '../../../../components/DeviceInfoBlock';
import { useFtlMsgResolver } from '../../../../models';
import { RemoteMetadata } from '../../../../lib/types';
// Inlined rather than loaded as a URL so the wordmark lettering can inherit
// `currentColor` — the fox glyph is all gradients, but the type is a flat fill
// that would be invisible on a dark surface otherwise.
import { ReactComponent as FirefoxWordmark } from './firefox-logo-wordmark.svg';
// Placeholder for the final illustration. The Figma frame is annotated
// "Github link to come", so this is the design export until UX publishes the
// shared asset; there is no ticket tracking that hand-off yet. When it lands,
// it should become an SVG in `components/images/` rendered via `PreparedImage`
// like every other illustration in this package.
import syncDevicesImage from './sync-devices.png';

export type ConnectThisDeviceProps = {
  /** Email of the account the device is about to be connected to. */
  email: string;
  /**
   * Metadata for the device that started the pairing — the desktop
   * "authority" — so the user can verify it before connecting.
   */
  authDeviceInfo: RemoteMetadata;
  onConnect?: () => void;
  onCancel?: () => void;
};

/**
 * Mobile "Connect this device" card for the supplicant side of the
 * desktop-to-mobile pairing flow.
 *
 * Presentational only: everything it displays arrives as props, and both the
 * buttons and the page-view/Glean metrics that sibling pairing pages emit are
 * deferred to the flow-wiring ticket, since nothing routes here yet.
 */
const ConnectThisDevice = ({
  email,
  authDeviceInfo,
  onConnect,
  onCancel,
}: ConnectThisDeviceProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const localizedLogoAlt = ftlMsgResolver.getMsg(
    'pair-connect-device-firefox-logo-alt',
    'Firefox'
  );
  const localizedIllustrationAlt = ftlMsgResolver.getMsg(
    'pair-connect-device-image-alt',
    'A desktop browser window and a mobile phone, both syncing, with the Firefox mascot alongside them'
  );

  return (
    <AppLayout>
      <div className="flex flex-col items-center text-center">
        <FirefoxWordmark
          role="img"
          aria-label={localizedLogoAlt}
          className="h-8 w-24 text-grey-900 dark:text-grey-10"
        />

        <img
          src={syncDevicesImage}
          alt={localizedIllustrationAlt}
          className="mt-10 h-[120px] w-[210px]"
        />

        <FtlMsg id="pair-connect-device-heading">
          <h1 className="card-header mt-4">
            Connect this device to your account?
          </h1>
        </FtlMsg>

        <p className="mt-1 text-base break-all">{email}</p>

        <DeviceInfoBlock
          remoteMetadata={authDeviceInfo}
          showDeviceName={false}
          className="mt-4 w-full rounded-md border border-grey-100 bg-white px-4 py-3 text-grey-500 dark:border-grey-500 dark:bg-grey-700 dark:text-grey-300"
        />

        <FtlMsg id="pair-connect-device-connect-button">
          <button
            type="button"
            className="cta-primary cta-xl mt-6 w-full"
            onClick={onConnect}
          >
            Connect
          </button>
        </FtlMsg>

        <FtlMsg id="pair-connect-device-cancel-button">
          <button
            type="button"
            className="link-grey mt-4 py-2 text-base"
            onClick={onCancel}
          >
            Cancel
          </button>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default ConnectThisDevice;
