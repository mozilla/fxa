/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';

/**
 * A collection of attributes about the client that will be used for
 * targeting an experiment.
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
): Promise<NimbusResult | null> {
  // Disabling experiment request for now. Leaving code here for the future
  // when we re-enable.

  const body = JSON.stringify({
    client_id: clientId,
    context,
  });

  try {
    const query =
      previewEnabled === true ? `?nimbusPreview=${previewEnabled}` : '';
    const resp = await fetch(`/nimbus-experiments${query}`, {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch((err) => {
      if (err instanceof TypeError) {
        Sentry.addBreadcrumb({
          category: 'nimbus-experiments',
          level: 'warning',
          message: 'Nimbus experiments fetch failed',
        });
        return null;
      }
      throw err;
    });

    if (resp?.status === 200) {
      return (await resp.json()) as NimbusResult;
    }
  } catch (err) {
    // A fetch TypeError (network failure) only leaves a breadcrumb, so it never gets here.
    Sentry.captureException(err, {
      tags: {
        source: 'nimbus-experiments',
      },
    });
  }

  return null;
}
