/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../../../components/AppLayout';
import DeviceInfoBlock from '../../../../components/DeviceInfoBlock';
import {
  FirefoxWordmarkImage,
  SyncDevicesImage,
} from '../../../../components/images';
import { RemoteMetadata } from '../../../../lib/types';

export type ConnectThisDeviceProps = {
  /**
   * The account this device would be connected to, shown so the user can
   * confirm it is the one they meant to pair with.
   */
  email?: string;
  /**
   * Details of the device that started pairing, shown so the user can confirm
   * the request came from their own computer. Supplied by the caller — this
   * component does not read the pairing channel itself.
   */
  remoteMetadata?: RemoteMetadata;
  /**
   * Completes pairing. Required so that routing this card cannot leave an
   * action inert — the flow logic itself lands with the route.
   */
  onConnect?: () => void;
  /**
   * Aborts pairing. Required for the same reason as `onConnect`.
   */
  onCancel?: () => void;
};

/**
 * The mobile screen shown after the user scans the pairing QR code, asking
 * them to confirm connecting this device to their account. It shows the
 * requesting computer's details so they can verify the request.
 */
const ConnectThisDevice = ({
  email,
  remoteMetadata,
  onConnect,
  onCancel,
}: ConnectThisDeviceProps) => {

  // TODO: Wire up props
  email = email ?? 'foo@mozilla.com';
  remoteMetadata = remoteMetadata ?? {
    deviceName: 'name-foo',
    deviceFamily: 'family-foo',
    deviceOS: 'os-foo',
    ipAddress: 'ip-foo',
    country: 'country-foo',
    region: 'region-foo',
    city: 'city-foo',
  }

  return <AppLayout>
    <div className="flex flex-col items-center text-center">
      <FirefoxWordmarkImage className="h-8 w-24 text-black dark:text-white" />

      <SyncDevicesImage className="mt-10 h-[120px] w-auto" />

      <FtlMsg id="pair2-supplicant-connect-this-device-heading">
        <h1 className="card-header mt-4">
          Connect this device to your account?
        </h1>
      </FtlMsg>
      {/* Raw user data, so it is deliberately not wrapped in FtlMsg. */}
      <p className="break-word mt-1 text-base">{email}</p>

      <DeviceInfoBlock
        {...{ remoteMetadata }}
        deviceNameDisplay="inline"
        className="mt-4 w-full rounded-md border border-grey-100 px-4 py-3 text-grey-500 dark:border-grey-500 dark:text-grey-300"
      />

      <FtlMsg id="pair2-supplicant-connect-this-device-connect-button">
        <button
          type="button"
          onClick={onConnect}
          className="cta-primary cta-xl mt-6 w-full"
        >
          Connect
        </button>
      </FtlMsg>
      <FtlMsg id="pair2-supplicant-connect-this-device-cancel-button">
        <button
          type="button"
          onClick={onCancel}
          className="link-dark-grey"
        >
          Cancel
        </button>
      </FtlMsg>
    </div>
  </AppLayout>
};

export default ConnectThisDevice;
