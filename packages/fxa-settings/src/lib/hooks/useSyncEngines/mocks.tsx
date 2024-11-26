/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useState } from 'react';
import {
  getSyncEngineIds,
  syncEngineConfigs,
} from '../../../components/ChooseWhatToSync/sync-engines';

export function useMockSyncEngines() {
  const [declinedSyncEngines, setDeclinedSyncEngines] = useState<string[]>([]);
  const offeredSyncEngines = getSyncEngineIds(syncEngineConfigs);

  const selectedEngines = offeredSyncEngines.reduce((acc, syncEngId) => {
    acc[syncEngId] = !declinedSyncEngines.includes(syncEngId);
    return acc;
  }, {} as Record<string, boolean>);

  return {
    offeredSyncEngines,
    offeredSyncEngineConfigs: syncEngineConfigs,
    declinedSyncEngines,
    setDeclinedSyncEngines,
    selectedEngines,
  };
}

export default useMockSyncEngines;
