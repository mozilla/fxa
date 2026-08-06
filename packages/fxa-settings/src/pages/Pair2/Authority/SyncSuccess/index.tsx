/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../../../components/AppLayout';
import { SyncSuccessImage } from '../../../../components/images';

export type SyncSuccessProps = {
  /**
   * Opens the list of tabs open on the user's other synced devices. Required so
   * that routing this card cannot leave the primary action inert — the browser
   * channel call itself lands with the flow wiring.
   */
  onViewSyncedTabs: () => void;
  /** Opens sync settings. Required for the same reason as `onViewSyncedTabs`. */
  onSyncSettings: () => void;
};

/**
 * The desktop screen shown once the mobile device has finished pairing and
 * sync is active. It confirms what is now syncing and offers the two follow-up
 * actions.
 *
 * Presentational only: routing and the page-view/Glean metrics that sibling
 * pairing pages emit land with the flow wiring.
 */
const SyncSuccess = ({
  onViewSyncedTabs,
  onSyncSettings,
}: SyncSuccessProps) => (
  <AppLayout>
    <div className="flex flex-col items-center text-center">
      <FtlMsg id="pair2-authority-sync-success-heading">
        <h1 className="card-header">You’re syncing</h1>
      </FtlMsg>
      <FtlMsg id="pair2-authority-sync-success-description">
        <p className="text-base">
          Your tabs, bookmarks, passwords, and more are ready across your
          devices.
        </p>
      </FtlMsg>

      <SyncSuccessImage className="mt-8 h-40 w-auto" />

      <FtlMsg id="pair2-authority-sync-success-view-tabs-button">
        <button
          type="button"
          onClick={onViewSyncedTabs}
          className="cta-primary cta-xl mt-8 w-full"
        >
          View synced tabs
        </button>
      </FtlMsg>
      <FtlMsg id="pair2-authority-sync-success-sync-settings-button">
        <button
          type="button"
          onClick={onSyncSettings}
          className="mt-4 py-2 text-base text-grey-900 underline dark:text-grey-10"
        >
          Sync settings
        </button>
      </FtlMsg>
    </div>
  </AppLayout>
);

export default SyncSuccess;
