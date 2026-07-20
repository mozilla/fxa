/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { deriveTokenCredentials } from './hawk';

// Prefix per FxA token kind. Must stay in sync with the server-side table
// in `packages/fxa-auth-server/lib/routes/auth-schemes/bearer-fxa-token.js`.
//
// Every prefix is `fx` (FxA) plus the first letter(s) of the kind:
//   fxs_   sessionToken
//   fxk_   keyFetchToken (server also accepts this for keyFetchTokenWith-
//          VerificationStatus; the client only derives one keyFetch
//          credential and never picks the with-verification variant)
//   fxar_  accountResetToken
//   fxpf_  passwordForgotToken
//   fxpc_  passwordChangeToken
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
