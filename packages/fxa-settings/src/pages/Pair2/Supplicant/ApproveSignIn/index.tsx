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

export type ApproveSignInProps = {
  /**
   * Details of the device that started pairing, shown so the user can confirm
   * the request came from their own computer. Supplied by the caller — this
   * component does not read the pairing channel itself.
   */
  remoteMetadata?: RemoteMetadata;
  /**
   * Aborts pairing. Required so that routing this card cannot leave the only
   * available action inert — the flow logic itself lands with the route.
   */
  onCancel?: () => void;
};

/**
 * The mobile waiting screen shown after the user scans the pairing QR code. It
 * tells them to finish approving the sign-in on their computer and shows the
 * requesting device's details for verification. Cancel is the only action.
 */
export const ApproveSignIn = ({ remoteMetadata, onCancel }: ApproveSignInProps) => {
  remoteMetadata = remoteMetadata ?? {
      deviceName: 'name-foo',
      deviceFamily: 'family-foo',
      deviceOS: 'os-foo',
      ipAddress: 'ip-foo',
      country: 'country-foo',
      region: 'region-foo',
      city: 'city-foo',
  };
  return <AppLayout>
    <div className="flex flex-col items-center text-center">
      <FirefoxWordmarkImage className="h-8 w-24 text-black dark:text-white" />

      <SyncDevicesImage className="mt-10 h-[120px] w-auto" />

      <FtlMsg id="pair2-supplicant-approve-sign-in-heading">
        <h1 className="card-header mt-4">One last step to sync</h1>
      </FtlMsg>
      <FtlMsg id="pair2-supplicant-approve-sign-in-instruction">
        <p className="mt-1 text-base">Approve the sign-in on your computer.</p>
      </FtlMsg>

      <DeviceInfoBlock
        {...{ remoteMetadata }}
        deviceNameDisplay="inline"
        className="mt-4 w-full rounded-md border border-grey-100 px-4 py-3 text-grey-500 dark:border-grey-500 dark:text-grey-300"
      />

      <FtlMsg id="pair2-supplicant-approve-sign-in-cancel-button">
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

export default ApproveSignIn;
