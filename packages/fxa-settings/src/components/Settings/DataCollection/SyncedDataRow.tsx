/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useBooleanState } from 'fxa-react/lib/hooks';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { FtlMsg } from 'fxa-react/lib/utils';
import UnitRow, { ModalButton } from '../UnitRow';
import { useFtlMsgResolver } from '../../../models';
import { firefox } from '../../../lib/channels/firefox';
import ModalDeleteSyncedData, {
  ModalDeleteSyncedDataVariant,
  SyncDevice,
} from './ModalDeleteSyncedData';

export type SyncedDataRowProps = {
  devices: SyncDevice[];
  /** True in Firefox Desktop, where the `fxaccounts:sync_preferences` web channel message opens about:preferences#sync. */
  canOpenSyncPreferences: boolean;
  modalVariant?: ModalDeleteSyncedDataVariant;
  onConfirmDelete?: (signOutDeviceIds: string[]) => void;
};

export const SyncedDataRow = ({
  devices,
  canOpenSyncPreferences,
  modalVariant = 'warning',
  onConfirmDelete = () => {},
}: SyncedDataRowProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const [modalRevealed, revealModal, hideModal] = useBooleanState();

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
    <>
      <UnitRow
        header={ftlMsgResolver.getMsg(
          'dc-subheader-synced-data',
          'Synced data'
        )}
        hideHeaderValue
        actionContent={
          // UnitRow's own CTA wraps and overflows next to long row text.
          <ModalButton
            ctaText={ftlMsgResolver.getMsg(
              'dc-synced-data-delete-button',
              'Delete synced data'
            )}
            // Nova's 16px comes from UnitRow's content padding.
            className="cta-neutral cta-base-p whitespace-nowrap @mobileLandscape/unitRow:ms-4 nova:@mobileLandscape/unitRow:ms-0"
            prefixDataTestId="synced-data"
            {...{ revealModal, modalRevealed }}
          />
        }
      >
        <p>
          <FtlMsg id="dc-synced-data-content" elems={{ link: accountAndSync }}>
            <span>
              Delete synced data stored on Mozilla’s servers. This won’t delete
              data on your devices or turn off syncing. To manage what syncs on
              this device, go to {accountAndSync} in Firefox Settings.
            </span>
          </FtlMsg>{' '}
          <LinkExternal
            href="https://support.mozilla.org/kb/how-do-i-set-sync-my-computer"
            className="link-blue whitespace-nowrap"
            data-testid="link-external-synced-data"
          >
            <FtlMsg id="dc-learn-more">Learn more</FtlMsg>
          </LinkExternal>
        </p>
      </UnitRow>
      {modalRevealed && (
        <ModalDeleteSyncedData
          {...{ devices }}
          variant={modalVariant}
          onDismiss={hideModal}
          onConfirm={(signOutDeviceIds) => {
            hideModal();
            onConfirmDelete(signOutDeviceIds);
          }}
        />
      )}
    </>
  );
};

export default SyncedDataRow;
