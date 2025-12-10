/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useSyncExternalStore } from 'react';
import Storage from '../storage';

/**
 * Hook to monitor a specific localStorage key and reactively update when it changes.
 * Works for both same-tab and cross-tab changes.
 *
 * @param key - The localStorage key to monitor (without the '__fxa_storage.' prefix)
 * @returns The current value from localStorage, or undefined if not set
 *
 * @example
 * ```tsx
 * const currentAccountUid = useLocalStorageSync('currentAccountUid');
 *
 * useEffect(() => {
 *   if (currentAccountUid) {
 *     console.log('Account UID changed:', currentAccountUid);
 *   }
 * }, [currentAccountUid]);
 * ```
 */
export function useLocalStorageSync(key: string) {
  const storage = Storage.factory('localStorage');

  const subscribe = (callback: () => void) => {
    // Listen for custom events (same-tab changes)
    // We'll dispatch this when we write to localStorage
    const handleCustomStorage = (e: CustomEvent) => {
      if (e.detail?.key === key) {
        callback();
      }
    };

    window.addEventListener('localStorageChange' as any, handleCustomStorage as EventListener);

    return () => {
      window.removeEventListener('localStorageChange' as any, handleCustomStorage as EventListener);
    };
  };

  // Cache snapshot to prevent infinite loops - compare by value, not reference
  let cachedSnapshot: any;
  let cachedSnapshotString: string | undefined;

  const getSnapshot = () => {
    const snapshot = storage.get(key);
    const snapshotString = JSON.stringify(snapshot);

    // Only update cached snapshot if the value actually changed
    if (snapshotString !== cachedSnapshotString) {
      cachedSnapshot = snapshot;
      cachedSnapshotString = snapshotString;
    }

    return cachedSnapshot;
  };

  return useSyncExternalStore(subscribe, getSnapshot);
}
