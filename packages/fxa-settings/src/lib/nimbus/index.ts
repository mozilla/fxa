/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';

/**
 * A collection of attributes about the client that will be used for
 * targetting an experiment.
 */
export type NimbusContextT = {
  language: string | null;
  region: string | null;
};

/**
 * Initializes Nimbus in the React app. This should be done before the first render
 * so that experiments can be applied during first initialization.
 *
 * @param clientId A unique identifier that is typically stable.
 * @param context See {@link NimbusContextT}.
 * @returns the experiment and enrollment information for that `clientId`.
 */
export async function initializeNimbus(
  clientId: string,
  context: NimbusContextT
) {
  const body = JSON.stringify({
    client_id: clientId,
    context,
  });

  let experiments;

  try {
    const resp = await fetch('/nimbus-experiments', {
      method: 'POST',
      body,
      // A request to cirrus should not be more than 50ms,
      // but we give it a large enough padding.
      signal: AbortSignal.timeout(1000),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (resp.status !== 200) {
      return;
    }

    experiments = await resp.json();
    console.log('!!!', experiments); // TODO: remove before landing.
  } catch (err) {
    Sentry.withScope(() => {
      let errorMsg = 'Experiment fetch error';
      if (err.name === 'TimeoutError') {
        errorMsg = 'Timeout: It took more than 1 seconds to get the result!';
      }
      Sentry.captureMessage(errorMsg, 'error');
    });
  }

  return experiments;
}
