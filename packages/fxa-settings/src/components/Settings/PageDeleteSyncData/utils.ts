/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Kept apart from the page so the Settings page can use these without loading the lazy delete flow.
import { SETTINGS_PATH } from '../../../constants';
import type { AttachedClient } from '../../../models';
import { sortAndFilterConnectedClients } from '../ConnectedServices';
import type { SyncDevice } from '../FlowDeleteSyncDataDevices';

export const DELETE_SYNC_DATA_PATH = `${SETTINGS_PATH}/delete_sync_data`;

/**
 * One row per device name, like Connected Services, keeping names where any
 * client holds the Sync key. Signing a row out disconnects every client in it.
 */
export const getSyncDevices = (clients: AttachedClient[]): SyncDevice[] => {
  const { groupedByName, sortedAndUniqueClients } =
    sortAndFilterConnectedClients(clients);
  return sortedAndUniqueClients.flatMap(({ name }) => {
    const group = groupedByName[String(name)];
    const syncCapable = group.find((c) => c.isSyncCapable);
    return syncCapable
      ? [
          {
            name,
            deviceType: syncCapable.deviceType,
            isCurrentSession: group.some((c) => c.isCurrentSession),
            clients: group,
          },
        ]
      : [];
  });
};
