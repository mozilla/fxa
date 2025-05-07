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
    });

    if (resp.status === 200) {
      return (await resp.json()) as NimbusResult;
    }
  } catch (err) {
    // Important, if this fails it will just show up in Sentry as a
    // TypeError: NetworkError when attempting to fetch resource.
    // Look at the previous fetch bread crumb to understand what
    // request is actually failing.
    Sentry.captureException(err, {
      tags: {
        source: 'nimbus-experiments',
      },
    });
  }

  return null;
}
