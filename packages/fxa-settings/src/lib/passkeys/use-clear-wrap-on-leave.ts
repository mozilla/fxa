/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, type RefObject } from 'react';
import { useMounted } from '../hooks/useMounted';
import type { SensitiveDataClient } from '../sensitive-data-client';

/**
 * Zeroes the pending passkey wrap material when the page unmounts, unless
 * `handedOff.current` says the next page now owns it. StrictMode unmounts and
 * remounts synchronously in development, so the clear is deferred one tick
 * and skipped if the page is mounted again by then.
 *
 * @returns Whether the page is currently mounted, for continuations that
 *   must not act after the user has left.
 */
export function useClearPasskeyWrapOnLeave(
  sensitiveDataClient: SensitiveDataClient,
  handedOff?: RefObject<boolean>
): RefObject<boolean> {
  const mounted = useMounted();
  useEffect(() => {
    return () => {
      queueMicrotask(() => {
        // Read at cleanup on purpose: the flag is set by the handoff that
        // triggers this unmount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        if (!mounted.current && !handedOff?.current) {
          sensitiveDataClient.clearPasskeyWrapData();
        }
      });
    };
  }, [sensitiveDataClient, handedOff, mounted]);
  return mounted;
}
