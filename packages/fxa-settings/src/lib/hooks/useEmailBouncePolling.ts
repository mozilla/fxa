/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useState } from 'react';
import AuthClient from 'fxa-auth-client/browser';

export const POLL_INTERVAL = 5000;
export const POLL_TIMEOUT = 5 * 60 * 1000;

/**
 * Polls for a hard bounce against `email` until one is found, the request
 * fails with a status code, or the cap elapses.
 *
 * The cap is a wall-clock deadline rather than a tick count, since a
 * backgrounded tab throttles timers. Five minutes at this interval is 60
 * requests, inside the server's budget of 100 per IP per 15 minutes.
 */
export function useEmailBouncePolling(
  email: string | undefined,
  authClient: AuthClient
) {
  // Keyed by the address that produced it, so a result for one email is never
  // reported against another the page has since moved to.
  const [bouncedEmail, setBouncedEmail] = useState<string>();

  useEffect(() => {
    if (!email) return;

    const pollDeadline = Date.now() + POLL_TIMEOUT;
    // Local to this run, so a check left in flight by an earlier one cannot
    // clear the interval this run owns.
    let intervalId: NodeJS.Timeout | undefined;

    const stopPolling = () => {
      clearInterval(intervalId);
    };

    const checkEmailBounceStatus = async () => {
      if (Date.now() >= pollDeadline) {
        stopPolling();
        return;
      }
      try {
        const result = await authClient.emailBounceStatus(email);
        if (result.hasHardBounce) {
          setBouncedEmail(email);
          stopPolling();
        }
      } catch (error) {
        console.error('Error checking email bounce status:', error);
        // A network failure carries no code, so polling continues there.
        const code = (error as { code?: number })?.code;
        if (code !== undefined && code >= 400 && code < 600) {
          stopPolling();
        }
      }
    };

    intervalId = setInterval(checkEmailBounceStatus, POLL_INTERVAL);
    checkEmailBounceStatus();

    return stopPolling;
  }, [authClient, email]);

  return !!email && bouncedEmail === email;
}
