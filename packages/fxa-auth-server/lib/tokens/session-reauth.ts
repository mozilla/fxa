/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { SessionTokenAuthCredential } from '../types';

/**
 * Whether a password has been verified on the session since it was created.
 *
 * `/session/reauth` is the only writer of `authAt`, and a session with none
 * recorded reads back with `authAt` equal to `createdAt`. A passkey sign-in,
 * or a `/passkey/verification` step-up on the session, moves neither.
 */
export function hasPasswordReauth(
  session: Pick<SessionTokenAuthCredential, 'createdAt' | 'authAt'>
): boolean {
  return (
    !!session.authAt &&
    !!session.createdAt &&
    session.authAt > session.createdAt
  );
}
