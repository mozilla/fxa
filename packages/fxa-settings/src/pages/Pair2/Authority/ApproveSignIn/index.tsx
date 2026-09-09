/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../../../components/AppLayout';
import DeviceInfoBlock from '../../../../components/DeviceInfoBlock';
import { SyncDevicesImage } from '../../../../components/images';
import { RemoteMetadata } from '../../../../lib/types';

export type ApproveSignInProps = {
  /** The signed-in account the pairing request would be granted against. */
  email: string;
  /**
   * Details of the device that scanned the pairing code, shown so the user can
   * confirm the request came from their own phone. Supplied by the caller —
   * this component does not read the pairing channel itself.
   */
  remoteMetadata: RemoteMetadata;
  /** Grants the pairing request. */
  onApprove: () => void;
  /**
   * Sends the user to change their password, the recovery path when they don't
   * recognize the request. An internal route rather than an external URL, so it
   * arrives as a callback instead of a `Link` — that keeps router context out of
   * this card's stories and tests.
   */
  onChangePassword: () => void;
};

/**
 * The desktop approval screen, shown on the already-signed-in computer once a
 * phone has scanned its pairing code. It names the account, shows the
 * requesting device's details for verification, and asks the user to approve.
 */
const ApproveSignIn = ({
  email,
  remoteMetadata,
  onApprove,
  onChangePassword,
}: ApproveSignInProps) => (
  <AppLayout>
    <div className="text-center">
      <FtlMsg id="pair2-authority-approve-sign-in-heading">
        <h1 className="card-header">Approve sign-in?</h1>
      </FtlMsg>

      <p className="mt-1 break-all text-base">{email}</p>

      <SyncDevicesImage className="mt-8 mb-4 h-[160px] w-auto mx-auto" />

      <DeviceInfoBlock
        {...{ remoteMetadata }}
        deviceNameDisplay="inline"
        className="mt-4 w-full rounded-md border border-grey-100 px-4 py-3 text-grey-500 dark:border-grey-500 dark:text-grey-300"
      />

      <FtlMsg id="pair2-authority-approve-sign-in-confirm-button">
        <button
          type="button"
          data-testid="pair2-auth-approve-btn"
          onClick={onApprove}
          className="cta-primary cta-xl mt-6 w-full"
        >
          Yes, approve sign-in
        </button>
      </FtlMsg>

      <FtlMsg
        id="pair2-authority-approve-sign-in-change-password"
        elems={{
          changePassword: (
            <button
              type="button"
              onClick={onChangePassword}
              className="text-grey-900 underline dark:text-grey-10"
            />
          ),
        }}
      >
        <p className="mt-6 text-xs">
          Not you?{' '}
          {/* This can be replaced with a link to account settings to change their password. */}
          <button
            type="button"
            onClick={onChangePassword}
            className="text-grey-900 underline dark:text-grey-10"
          >
            Change your password
          </button>
        </p>
      </FtlMsg>
    </div>
  </AppLayout>
);

export default ApproveSignIn;
