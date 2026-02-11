/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { useCallback, useRef } from 'react';

export function useCallbackOnce(cb: () => void, deps: any[]) {
  const called = useRef(false);
  return useCallback(() => {
    if (!called.current) {
      cb();
      called.current = true;
    }
  }, [called, cb, ...deps]);
}
