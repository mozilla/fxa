/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SecurityEventNames } from 'fxa-shared/db/models/auth/security-event';
import {
  AccountEventsManager,
  SecurityEventLoginMethod,
} from '../../account-events';
import { Container } from 'typedi';

type RecordSecurityEventOpts = {
  method?: SecurityEventLoginMethod;
  // Routes that create a session while unauthenticated must pass the new
  // session token id. Without it the stored proc cannot find the pending
  // tokenVerificationId and marks the row verified.
  tokenId?: string;
  [key: string]: any;
};

export async function recordSecurityEvent(
  name: SecurityEventNames,
  opts: RecordSecurityEventOpts
) {
  const mgr = Container.get(AccountEventsManager);
  if (mgr == null || typeof mgr.recordSecurityEvent !== 'function') {
    return;
  }

  const clientId = opts?.request?.app?.clientIdTag;
  const service = opts?.request?.app?.serviceTag;
  const headers = opts?.request?.headers;

  const waf = {
    clientJa4: headers?.['client-ja4'],
    clientJa3: headers?.['client-ja3'],
    fastlyRequestId: headers?.['x-fastly-request-id'],
    sigsciRequestId: headers?.['x-sigsci-requestid'],
    sigsciTags: headers?.['x-sigsci-tags'],
  };

  await mgr.recordSecurityEvent(opts.db, {
    name,
    uid: opts?.account?.uid || opts?.request?.auth?.credentials?.uid,
    ipAddr: opts?.request?.app?.clientAddress,
    tokenId: opts?.tokenId ?? opts?.request?.auth?.credentials?.id,
    additionalInfo: {
      userAgent: opts?.request.headers['user-agent'],
      location: opts?.request.app.geo.location,
      ...(clientId && { client_id: clientId }),
      ...(service && { service }),
      ...(opts?.method && { method: opts.method }),
      waf: Object.values(waf).some(Boolean) ? waf : undefined,
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
    skipTimeframeMs,
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
