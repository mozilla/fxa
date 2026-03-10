/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SecurityEventNames } from 'fxa-shared/db/models/auth/security-event';
import { AccountEventsManager } from '../../account-events';
import { AppConfig } from '../../types';
import { Container } from 'typedi';

// Match any non-empty hex-encoded string (even number of hex chars)
const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/;

/**
 * Validates and returns a client_id if it's allowed for tracking.
 * Only returns the client_id if it's "sync" or exists in the oauth.clientIds allowlist.
 */
export function getValidatedClientId(
  service: string | undefined,
  oauthClientIds: Record<string, string>
): string | undefined {
  if (!service) {
    return undefined;
  }

  // Allow "sync" as a special legacy case
  if (service === 'sync') {
    return service;
  }

  // Only allow hex client IDs that are in the allowlist
  if (HEX_STRING.test(service) && oauthClientIds[service]) {
    return service;
  }

  return undefined;
}

export async function recordSecurityEvent(name: SecurityEventNames, opts: any) {
  const mgr = Container.get(AccountEventsManager);
  if (mgr == null || typeof mgr.recordSecurityEvent !== 'function') {
    return;
  }

  // Get oauth client IDs from config if available
  let oauthClientIds: Record<string, string> = {};
  if (Container.has(AppConfig)) {
    const config = Container.get(AppConfig);
    oauthClientIds = config.oauth?.clientIds || {};
  }

  // Extract service from request payload or query
  const service =
    opts?.request?.payload?.service || opts?.request?.query?.service;
  const client_id = getValidatedClientId(service, oauthClientIds);

  await mgr.recordSecurityEvent(opts.db, {
    name,
    uid: opts?.account?.uid || opts?.request?.auth?.credentials?.uid,
    ipAddr: opts?.request?.app?.clientAddress,
    tokenId: opts?.request?.auth?.credentials?.id,
    additionalInfo: {
      userAgent: opts?.request.headers['user-agent'],
      location: opts?.request.app.geo.location,
      ...(client_id && { client_id }),
    },
  });
}

export async function isRecognizedDevice(
  db: any,
  uid: string,
  userAgent: string,
  skipTimeframeMs: number
): Promise<boolean> {
  const verifiedLoginEvents = await db.verifiedLoginSecurityEventsByUid({
    uid,
    skipTimeframeMs
  });

  if (!verifiedLoginEvents || verifiedLoginEvents.length === 0) {
    return false;
  }

  // Search through the results for matching user agent
  for (const event of verifiedLoginEvents) {
    if (event.additionalInfo) {
      try {
        const additionalInfo = JSON.parse(event.additionalInfo);
        if (additionalInfo.userAgent === userAgent) {
          return true;
        }
      } catch (e) {
        // Skip events with invalid JSON
      }
    }
  }

  return false;
}
