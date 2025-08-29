/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { storage } from '../storage';

const STORAGE_KEY_ORIGINAL_TAB = 'ORIGINAL_TAB_KEY';

// I guess this means it was the tab we entered with??? /notsure.
// But it seems like we don't use this any more, so exporting as deprecate
// for now.
/**
 * Determined if the current tab is the 'original tab'.
 * @returns
 */
export function deprecated__isOriginalTab() {
  let value = storage.session.get(STORAGE_KEY_ORIGINAL_TAB);

  // Fallback for content server's applied state.
  if (value == null) {
    value = storage.legacySessionStorage.getItem(STORAGE_KEY_ORIGINAL_TAB);
  }

  return value;
}

export function deprecated__clearOriginalTab() {
  return storage.session.remove(STORAGE_KEY_ORIGINAL_TAB);
}

export function deprecated__setOriginalTabMarker() {
  storage.session.set(STORAGE_KEY_ORIGINAL_TAB, '1');
}
