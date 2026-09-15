/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../../../components/AppLayout';
import { SyncSuccessImage } from '../../../../components/images';

export type SyncSuccessProps = {
  /**
   * Opens sync settings. Optional so that this card can be routed ahead of the
   * browser channel call, which lands with the flow wiring.
   */
  onSyncSettings?: () => void;
};

/**
 * The desktop screen shown once the mobile device has finished pairing and
 * sync is active. It confirms that syncing has started and links to sync
 * settings.
 */
const SyncSuccess = ({ onSyncSettings }: SyncSuccessProps) => (
  <AppLayout>
    <div className="flex flex-col items-center text-center">
      <FtlMsg id="pair2-authority-sync-success-heading-v2">
        <h1 className="card-header">Your device is connected</h1>
      </FtlMsg>
      <FtlMsg id="pair2-authority-sync-success-description-v2">
        <p className="text-base">
          Syncing is underway. It may take a while for your synced data to
          appear. Feel free to keep browsing.
        </p>
      </FtlMsg>

      <SyncSuccessImage className="mt-6 h-40 w-auto" />

      <FtlMsg id="pair2-authority-sync-success-sync-settings-button-v2">
        <button
          type="button"
          onClick={onSyncSettings}
          className="link-dark-grey mt-6"
        >
          Manage sync settings
        </button>
      </FtlMsg>
    </div>
  </AppLayout>
);

export default SyncSuccess;
