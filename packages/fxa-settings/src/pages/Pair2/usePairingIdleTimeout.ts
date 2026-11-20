/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect } from 'react';
import * as Sentry from '@sentry/browser';
import config from '../../lib/config';
import { navigateWithQuery } from '../../lib/utilities';

/**
 * Ends a pairing that sits on one page for `pairing.qrTimeoutMinutes`. Neither
 * device can tell an expired channel from a closed one, so this timer is the
 * only thing that can report a timeout as a timeout.
 */
export function usePairingIdleTimeout(
  integration: { destroy(): Promise<void> },
  timeoutPath: string
) {
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(
      async () => {
        try {
          await integration.destroy();
        } catch (err) {
          Sentry.captureException(err);
        }
        // The page may have left for another reason while the channel closed.
        if (active) {
          navigateWithQuery(
            timeoutPath,
            { state: { reason: 'timeout' } },
            true
          );
        }
      },
      config.pairing.qrTimeoutMinutes * 60 * 1000
    );
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [integration, timeoutPath]);
}
