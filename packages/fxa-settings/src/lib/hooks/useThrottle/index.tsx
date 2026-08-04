/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useCallback, useEffect, useRef, useState } from 'react';

type ThrottleErrorInput = {
  retryAfter?: number;
};

type UseThrottleResult = {
  isThrottled: boolean;
  startThrottle: (error: ThrottleErrorInput) => void;
};

/**
 * Disables retry controls for the server's retryAfter window after a THROTTLED
 * (errno 114) response, then re-enables them. retryAfter is the v2 rate-limit
 * value in milliseconds. A missing or invalid retryAfter is ignored: there's no
 * window to wait out, and the error banner already covers it.
 */
function useThrottle(): UseThrottleResult {
  const [isThrottled, setIsThrottled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const startThrottle = useCallback((error: ThrottleErrorInput) => {
    const retryAfterMs = error.retryAfter ?? 0;
    if (!Number.isFinite(retryAfterMs) || retryAfterMs <= 0) {
      return;
    }
    clearTimeout(timerRef.current);
    setIsThrottled(true);
    timerRef.current = setTimeout(() => setIsThrottled(false), retryAfterMs);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { isThrottled, startThrottle };
}

export default useThrottle;
