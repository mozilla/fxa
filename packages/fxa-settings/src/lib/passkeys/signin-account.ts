/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FtlMsgResolver } from 'fxa-react/lib/utils';
import { storeAccountData } from '../storage-utils';
import { ensureCanLinkAcountOrRedirect } from '../../pages/Signin/utils';
import type { useNavigateWithQuery } from '../hooks/useNavigateWithQuery';
import type {
  PasskeyAuthCompletion,
  PasskeySignInAuthClient,
  PasskeySignInIntegration,
} from './signin-flow';

/**
 * Shape of an entry in `authClient.account(...)`'s `emails` array. The
 * auth-client return type isn't formally typed; this local interface
 * documents the subset we depend on.
 */
type AccountEmail = {
  email: string;
  isPrimary: boolean;
  verified: boolean;
};

export type SignedInAccount = { email: string; accountHasTotp: boolean };

/**
 * Looks up the account behind a completed passkey assertion, runs the Sync
 * merge gate, and persists the session. Returns undefined when the user
 * declined the merge and has been redirected.
 *
 * Throws when the account has no primary email: downstream code
 * (storeAccountData, can_link_account WebChannel, handleNavigation) would
 * silently corrupt with undefined.
 */
export async function resolveSignedInAccount({
  authClient,
  integration,
  completion,
  ftlMsgResolver,
  navigateWithQuery,
}: {
  authClient: Pick<PasskeySignInAuthClient, 'account'>;
  integration: PasskeySignInIntegration;
  completion: PasskeyAuthCompletion;
  ftlMsgResolver: FtlMsgResolver;
  navigateWithQuery: ReturnType<typeof useNavigateWithQuery>;
}): Promise<SignedInAccount | undefined> {
  // The server returns canonical (lowercased) email; safe to forward as-is.
  const account = await authClient.account(completion.sessionToken);
  const email = account?.emails?.find((e: AccountEmail) => e.isPrimary)?.email;
  if (typeof email !== 'string') {
    throw new Error('Authenticated account response missing email');
  }

  // Runs before storeAccountData so a dismissed merge dialog doesn't
  // leave a ghost session that Index would re-evaluate as signed-in.
  if (integration.isSync() || integration.isFirefoxNonSync()) {
    const canLink = await ensureCanLinkAcountOrRedirect({
      email,
      uid: completion.uid,
      ftlMsgResolver,
      navigateWithQuery,
    });
    if (!canLink) {
      return undefined;
    }
  }

  // Mirrors Signin/container.tsx's persist-after-sign-in pattern.
  storeAccountData({
    email,
    uid: completion.uid,
    lastLogin: Date.now(),
    sessionToken: completion.sessionToken,
    verified: completion.verified,
    sessionVerified: completion.verified,
    hasPassword: completion.hasPassword,
  });

  return { email, accountHasTotp: !!account?.totp?.verified };
}
