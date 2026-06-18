/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Whether an OAuth signin is the user's *first* use of a service / relying
// party, used to set `firstAuthorization` on the `login` event (FXA-13784).
// Two grains, since the accountAuthorizations ledger keys on
// (uid, scope, service, clientId):
//  - Native (browser) client with a resolved service: "new to the service",
//    keyed on `service` (ignoring clientId), so it's correct across the user's
//    devices/apps. NOT currently reliable for `sync` — Desktop always creates a
//    sync-scoped access token even when signing into another service, so a first
//    `sync` can't be told apart; emitted anyway (flagged in the docs) pending a
//    desktop fix.
//  - Web RP (non-native client): "new to the RP", keyed on `clientId`. Any
//    `service=` a web RP sends is intentionally ignored — `service` is only
//    meaningful for native clients, so a web RP cannot spoof a browser service.
//  - Native client with no resolved service: ambiguous; returns false without a
//    DB query.

export interface FirstAuthorizationDb {
  /** True iff the user has any prior consent row for this service. */
  hasConsentForService(uid: string, service: string): Promise<boolean>;
  /** True iff the user has any prior consent row for this client. */
  hasConsentForClient(uid: string, clientId: string): Promise<boolean>;
}

export async function isFirstAuthorization(
  db: FirstAuthorizationDb,
  params: {
    uid: string;
    /** Resolved native service for this authorization ('' for web RPs). */
    serviceValue: string;
    /** Hex OAuth client id for this authorization. */
    clientIdHex: string;
    /** Whether clientIdHex is a native (browser) client. */
    isNativeClient: boolean;
  }
): Promise<boolean> {
  const { uid, serviceValue, clientIdHex, isNativeClient } = params;

  if (isNativeClient && serviceValue) {
    return !(await db.hasConsentForService(uid, serviceValue));
  }

  if (!isNativeClient) {
    return !(await db.hasConsentForClient(uid, clientIdHex));
  }

  // Native client with no resolved service: ambiguous, no query needed.
  return false;
}
