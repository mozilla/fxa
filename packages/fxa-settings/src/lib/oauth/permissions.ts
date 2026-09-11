/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getAccountByUid } from '../cache';
import { persistAccount } from '../storage-utils';

/**
 * Profile scopes the consent screen can describe, in display order.
 * `profile:avatar` is absent because the screen only shows for an untrusted
 * client, and UNTRUSTED_CLIENT_ALLOWED_SCOPES in lib/oauth/grant.js never
 * permits it.
 */
export const DISPLAYABLE_PERMISSIONS = [
  'profile:email',
  'profile:display_name',
] as const;

export type DisplayablePermission = (typeof DISPLAYABLE_PERMISSIONS)[number];

/** Client ids key the stored grant map, so an id must be hex to reach it. */
const CLIENT_ID_REGEX = /^[0-9a-f]{16}$/;

/**
 * The requested scopes the screen can describe, in display order. Returns the
 * intersection with DISPLAYABLE_PERMISSIONS, so the order follows the display
 * list rather than the order the relying party sent.
 */
export function displayablePermissions(
  scopes: string[]
): DisplayablePermission[] {
  return DISPLAYABLE_PERMISSIONS.filter((scope) => scopes.includes(scope));
}

export function hasSeenPermissions(
  uid: string,
  clientId: string,
  scopes: string[]
): boolean {
  if (!CLIENT_ID_REGEX.test(clientId)) {
    return false;
  }
  const seen = getAccountByUid(uid)?.grantedPermissions?.[clientId] ?? [];
  return scopes.every((scope) => seen.includes(scope));
}

/**
 * Records the scopes the user was shown for a client. The screen informs and
 * does not offer a choice, so this only suppresses a repeat prompt. A relying
 * party that later asks for a scope the user has not seen prompts again.
 */
export function recordSeenPermissions(
  uid: string,
  clientId: string,
  scopes: string[]
): void {
  if (!CLIENT_ID_REGEX.test(clientId)) {
    return;
  }
  const account = getAccountByUid(uid);
  if (!account) {
    return;
  }
  const granted = { ...(account.grantedPermissions ?? {}) };
  granted[clientId] = Array.from(
    new Set([...(granted[clientId] ?? []), ...scopes])
  );
  persistAccount({ uid, grantedPermissions: granted });
}

/**
 * Whether the consent screen must be shown before the OAuth flow completes.
 * Only a client known to be untrusted sees it. A trusted client may hold a
 * key-bearing scope, and `unwrapBKey` is deliberately absent from router
 * state, so diverting a trusted flow through a page would lose the key
 * material. A client whose lookup has not resolved is not untrusted, so it
 * does not see the screen either.
 */
export function needsPermissions({
  untrusted,
  scopes,
  uid,
  clientId,
}: {
  untrusted: boolean;
  scopes: string[];
  uid: string;
  clientId: string;
}): boolean {
  if (!untrusted) {
    return false;
  }
  const displayable = displayablePermissions(scopes);
  return (
    displayable.length > 0 && !hasSeenPermissions(uid, clientId, displayable)
  );
}
