/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../../../components/AppLayout';
import {
  FirefoxWordmarkImage,
  SyncSuccessImage,
} from '../../../../components/images';

/**
 * The mobile screen shown once pairing has completed: the device is signed in
 * and syncing. It confirms that syncing has started.
 */
const SyncSuccess = () => {
  return (
    <AppLayout whiteBackground>
      <div className="flex flex-col items-center text-center">
        <FirefoxWordmarkImage className="h-8 w-24 text-black dark:text-white" />

        <SyncSuccessImage className="mt-10 h-[176px] w-auto" />

        <FtlMsg id="pair2-supplicant-sync-success-heading">
          <h1 className="card-header mt-4">Your device is connected</h1>
        </FtlMsg>
        <FtlMsg id="pair2-supplicant-sync-success-description-v2">
          <p className="mt-1 text-base">
            Syncing is underway. It may take a while for your synced data to
            appear. Feel free to keep browsing.
          </p>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default SyncSuccess;
