/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { FtlMsg } from 'fxa-react/lib/utils';
import UnitRow from '../UnitRow';
import { useFtlMsgResolver } from '../../../models';
import { firefox } from '../../../lib/channels/firefox';
import { DELETE_SYNC_DATA_PATH } from '../PageDeleteSyncData/utils';

export type SyncedDataRowProps = {
  /** True in Firefox Desktop, where the `fxaccounts:sync_preferences` web channel message opens about:preferences#sync. */
  canOpenSyncPreferences?: boolean;
};

export const SyncedDataRow = ({
  canOpenSyncPreferences = false,
}: SyncedDataRowProps) => {
  const ftlMsgResolver = useFtlMsgResolver();

  const accountAndSync = canOpenSyncPreferences ? (
    <button
      type="button"
      className="link-blue underline"
      onClick={() => firefox.fxaOpenSyncPreferences()}
      data-testid="synced-data-open-sync-preferences"
    >
      Account and sync
    </button>
  ) : (
    <span>Account and sync</span>
  );

  return (
    <UnitRow
      header={ftlMsgResolver.getMsg('dc-subheader-synced-data', 'Synced data')}
      hideHeaderValue
      route={DELETE_SYNC_DATA_PATH}
      ctaText={ftlMsgResolver.getMsg(
        'dc-synced-data-delete-button',
        'Delete synced data'
      )}
      prefixDataTestId="synced-data"
    >
      <FtlMsg
        id="dc-synced-data-content"
        elems={{ accountSettingsLink: accountAndSync }}
      >
        <p>
          Delete synced data stored on Mozilla’s servers. This won’t delete data
          on your devices or turn off syncing. To manage what syncs on this
          device, go to {accountAndSync} in Firefox Settings.
        </p>
      </FtlMsg>
      <LinkExternal
        href="https://support.mozilla.org/kb/how-do-i-set-sync-my-computer"
        className="link-blue inline-block mt-2"
        data-testid="link-external-synced-data"
      >
        <FtlMsg id="dc-learn-more">Learn more</FtlMsg>
      </LinkExternal>
    </UnitRow>
  );
};

export default SyncedDataRow;
