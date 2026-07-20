/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { NormalizedAccess } from '../types';

export function flattenOfferingCapabilities(
  offerings:
    | ReadonlyArray<
        | {
            capabilities?: NormalizedAccess['capabilities'];
          }
        | null
        | undefined
      >
    | null
    | undefined
): NormalizedAccess['capabilities'] {
  if (!offerings) return null;
  const flat: NonNullable<NormalizedAccess['capabilities']>[number][] = [];
  for (const offering of offerings) {
    for (const capability of offering?.capabilities ?? []) {
      flat.push(capability);
    }
  }
  return flat;
}
