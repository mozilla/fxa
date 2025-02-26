/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';

export default class Nimbus {
  static experiments: any;

  static async initialize(clientId: string, context: any) {
    const body = JSON.stringify({
      client_id: clientId,
      context,
    });

    try {
      const resp = await fetch('/nimbus-experiments', {
        method: 'POST',
        body,
        // A request to cirrus should not be more than 50ms,
        // but this timeout is public-facing so may take longer.
        signal: AbortSignal.timeout(1000),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (resp.status !== 200) {
        this.experiments = null;
        return;
      }

      this.experiments = await resp.json();
    } catch (err) {
      if (err.name === 'TimeoutError') {
        // We can't do much here if we're reaching timeouts from network issues.
        return;
      }

      Sentry.withScope(() => {
        Sentry.captureMessage('Experiment fetch error', 'error');
      });

      // Finally, always clear out the experiments;
      this.experiments = null;
    }
  }
}
