/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { deriveTokenCredentials } from './hawk';

// Prefix per FxA token kind. Must stay in sync with the server-side table in
// `packages/fxa-auth-server/lib/routes/auth-schemes/bearer-fxa-token.js`.
// The `*WithVerificationStatus` variant reuses `fxk_` on the wire; the
// server chooses which strategy runs based on route config.
export const TOKEN_PREFIXES = {
  sessionToken: 'fxs',
  keyFetchToken: 'fxk',
  accountResetToken: 'fxar',
  passwordForgotToken: 'fxpf',
  passwordChangeToken: 'fxpc',
} as const;

export type BearerTokenKind = keyof typeof TOKEN_PREFIXES;

export async function bearerHeader(
  token: hexstring,
  kind: BearerTokenKind
): Promise<Headers> {
  const prefix = TOKEN_PREFIXES[kind];
  if (!prefix) {
    throw new Error(`bearerHeader: unknown token kind '${kind}'`);
  }
  const { id } = await deriveTokenCredentials(token, kind);
  return new Headers({ authorization: `Bearer ${prefix}_${id}` });
}
