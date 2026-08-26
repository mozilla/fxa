/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getSyncEngineIds, syncEngineConfigs } from '../../sync-engines';
import type { UseFxAStatusResult } from '.';

export function mockUseFxAStatus({
  pairingEnabled = true,
  pairingVersion = 1,
  offeredSyncEnginesOverride,
  supportsKeysOptionalLogin = false,
  supportsCanLinkAccountUid,
}: {
  pairingEnabled?: boolean;
  pairingVersion?: number;
  offeredSyncEnginesOverride?: ReturnType<typeof getSyncEngineIds>;
  supportsKeysOptionalLogin?: boolean;
  supportsCanLinkAccountUid?: boolean | undefined;
} = {}) {
  const offeredSyncEngineConfigs = syncEngineConfigs;
  const offeredSyncEngines =
    offeredSyncEnginesOverride || getSyncEngineIds(offeredSyncEngineConfigs);

  const declinedSyncEngines = offeredSyncEngineConfigs
    .filter((engineConfig) => !engineConfig.defaultInclude)
    .map((engineConfig) => engineConfig.id);

  const selectedEnginesForGlean = offeredSyncEngines.reduce(
    (acc, syncEngId) => {
      acc[syncEngId] = !declinedSyncEngines.includes(syncEngId);
      return acc;
    },
    {} as Record<string, boolean>
  );

  return {
    offeredSyncEngines,
    offeredSyncEngineConfigs,
    declinedSyncEngines,
    selectedEnginesForGlean,
    supportsKeysOptionalLogin,
    supportsCanLinkAccountUid,
    fxaStatus: {
      capabilities: {
        engines: [],
        multiService: true,
        choose_what_to_sync: true,
        keys_optional: true,
        can_link_account_uid: true,
        pairing: pairingEnabled,
        pairingVersion,
      },
    },
  } satisfies UseFxAStatusResult;
}

export default mockUseFxAStatus;
