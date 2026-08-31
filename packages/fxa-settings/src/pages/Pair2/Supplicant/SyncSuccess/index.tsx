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
import GleanMetrics from '../../../../lib/glean';
import { useGleanView } from '../../../../lib/glean/useGleanView';

export type SyncSuccessProps = {
  /**
   * Opens the browser's synced tabs view.
   */
  onViewSyncedTabs?: () => void;
  /**
   * Opens the browser's sync settings.
   */
  onSyncSettings?: () => void;
};

/**
 * The mobile screen shown once pairing has completed: the device is signed in
 * and syncing. It offers a jump to the synced tabs view and a secondary link to
 * sync settings.
 */
const SyncSuccess = ({
  onViewSyncedTabs,
  onSyncSettings,
}: SyncSuccessProps) => {
  // Custom view event rather than the automatic page load, so the terminal step
  // of the funnel is an event that carries `session.pairing_channel_hash` and
  // joins to the desktop device's own success view.
  useGleanView(() => GleanMetrics.dtmMobile.pairSuccessView());

  return <AppLayout whiteBackground>
    <div className="flex flex-col items-center text-center">
      <FirefoxWordmarkImage className="h-8 w-24 text-black dark:text-white" />

      <SyncSuccessImage className="mt-10 h-[176px] w-auto" />

      <FtlMsg id="pair2-supplicant-sync-success-heading">
        <h1 className="card-header mt-4">Your device is connected</h1>
      </FtlMsg>
      <FtlMsg id="pair2-supplicant-sync-success-description">
        <p className="mt-1 text-base">
          Your bookmarks, tabs, and more will stay synced in Firefox.
        </p>
      </FtlMsg>

      <FtlMsg id="pair2-supplicant-sync-success-view-tabs-button">
        <button
          type="button"
          onClick={onViewSyncedTabs}
          data-glean-id="dtm_mobile_pair_success_view_tabs"
          className="cta-primary cta-xl mt-6 w-full"
        >
          View synced tabs
        </button>
      </FtlMsg>
      <FtlMsg id="pair2-supplicant-sync-success-sync-settings-button">
        <button
          type="button"
          onClick={onSyncSettings}
          data-glean-id="dtm_mobile_pair_success_sync_settings"
          className="mt-4 py-2 text-base text-grey-900 underline dark:text-grey-10"
        >
          Sync settings
        </button>
      </FtlMsg>
    </div>
  </AppLayout>
};

export default SyncSuccess;
