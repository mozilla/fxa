/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OAuthNativeClients, OAuthNativeServices } from '@fxa/accounts/oauth';
import { MetricsContext } from '@fxa/shared/metrics/glean';

export type ClientTagsRequest = {
  app: {
    metricsContext: Promise<Partial<MetricsContext>>;
    clientIdTag?: string;
    serviceTag?: string;
  };
  payload: any;
  query: any;
};

const nativeClientIds = new Set<string>(Object.values(OAuthNativeClients));
const validServices = new Set<string>(Object.values(OAuthNativeServices));

/**
 * Resolves and validates clientId and service from the request's metricsContext.
 * Only returns values that are in the known allowlists to prevent infinite
 * cardinality in StatsD metrics.
 *
 * clientId is accepted if it exists in configuredClientIds (which includes
 * native clients). service is only resolved for native clients, as those are
 * the only IDs where service applies (e.g. Firefox Desktop can be sync,
 * relay, vpn, etc.).
 */
export async function resolveClientTags(
  request: ClientTagsRequest,
  configuredClientIds?: Set<string>
): Promise<{
  clientId: string | undefined;
  service: string | undefined;
}> {
  let clientId: string | undefined;
  let service: string | undefined;

  try {
    const metricsContext = await request.app.metricsContext;
    const rawClientId = metricsContext?.clientId;

    if (rawClientId && configuredClientIds?.has(rawClientId)) {
      clientId = rawClientId;

      // service only applies to native clients and can come from payload,
      // query, or stashed metricsContext
      if (nativeClientIds.has(rawClientId)) {
        const rawService =
          (request.payload as any)?.service ||
          (request.query as any)?.service ||
          metricsContext?.service;

        if (rawService && validServices.has(rawService)) {
          service = rawService;
        }
      }
    }
  } catch {
    // If metricsContext resolution fails, just return undefined for both
  }

  return { clientId, service };
}

/**
 * Helper to read pre-resolved clientId/service tags from request.app.
 * Use this in route handlers after the onPreHandler hook has run.
 */
export function getClientServiceTags(
  request: ClientTagsRequest
): Record<string, string> {
  const tags: Record<string, string> = {};
  if (request.app.clientIdTag) {
    tags.clientId = request.app.clientIdTag;
  }
  if (request.app.serviceTag) {
    tags.service = request.app.serviceTag;
  }
  return tags;
}
