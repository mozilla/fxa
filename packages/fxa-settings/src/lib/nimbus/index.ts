/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import { searchParams } from '../utilities';

/**
 * A collection of attributes about the client that will be used for
 * targetting an experiment.
 */
export type NimbusContextT = {
  language: string | null;
  region: string | null;
};

/**
 * The nimbus experiments and enrollment information needed for applying a feature experiment.
 */
export interface NimbusResult {
  features: Record<string, any>;
  nimbusUserId: string;
}

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
  previewEnabled: boolean,
  context: NimbusContextT
): Promise<any> {
  const MAX_TIMEOUT_MS = 1000;
  const body = JSON.stringify({
    client_id: clientId,
    context,
  });
  const nimbusPreview = previewEnabled
    ? previewEnabled
    : searchParams(window.location.search).nimbusPreview;

  let experiments;

  try {
    const resp = await fetch(
      `/nimbus-experiments?nimbusPreview=${nimbusPreview}`,
      {
        method: 'POST',
        body,
        // A request to cirrus should not be more than 50ms,
        // but we give it a large enough padding.
        signal: AbortSignal.timeout(MAX_TIMEOUT_MS),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (resp.status !== 200) {
      return;
    }

    experiments = resp.json();
  } catch (err) {
    Sentry.withScope(() => {
      let errorMsg = 'Experiment fetch error';
      if (err.name === 'TimeoutError') {
        errorMsg = `Timeout: It took more than ${MAX_TIMEOUT_MS} milliseconds to get the result!`;
      }
      Sentry.captureMessage(errorMsg, 'error');
    });
  }

  return experiments;
}
