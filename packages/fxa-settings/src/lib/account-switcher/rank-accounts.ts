/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UnifiedAccountData } from '../account-storage';
import { AccountAvatar } from '../interfaces';

export interface SwitchableAccount {
  uid: string;
  email: string;
  displayName?: string | null;
  avatar?: AccountAvatar | null;
  /** False when there is no stored session token, so signing in is needed. */
  hasSession: boolean;
  isCurrent: boolean;
  isFirefoxSignedIn: boolean;
  lastLogin?: number;
}

export interface RankAccountsInput {
  accounts: Record<string, Partial<UnifiedAccountData>>;
  /**
   * Email an RP asked for, when there is one. Only promotes an account that is
   * already current or signed in to the browser: the param is attacker
   * controllable, so on a shared device it must not make someone else's cached
   * account the one-click default.
   */
  requestedEmail?: string;
  firefoxSignedInUid?: string | null;
  currentAccountUid?: string | null;
}

/** Tiers, highest first. Within a tier, most recent login wins. */
enum Rank {
  RequestedEmail = 0,
  FirefoxSignedIn = 1,
  Current = 2,
  Other = 3,
}

function normalizeEmail(email?: string | null): string {
  return (email || '').trim().toLowerCase();
}

/**
 * Orders the stored accounts so the best guess at "who is signing in" comes
 * first.
 */
export function rankAccounts({
  accounts,
  requestedEmail,
  firefoxSignedInUid,
  currentAccountUid,
}: RankAccountsInput): SwitchableAccount[] {
  const wanted = normalizeEmail(requestedEmail);

  const switchable: SwitchableAccount[] = Object.entries(accounts)
    // Content-server writes through its own allowlist and can leave rows sparse;
    // without a uid and an email an account cannot be signed into or labelled.
    .filter(([uid, account]) => !!uid && !!account?.email)
    .map(([uid, account]) => ({
      uid,
      email: account.email as string,
      displayName: account.displayName ?? null,
      avatar: account.avatar ?? null,
      hasSession: !!account.sessionToken,
      isCurrent: uid === currentAccountUid,
      isFirefoxSignedIn: !!firefoxSignedInUid && uid === firefoxSignedInUid,
      lastLogin: account.lastLogin,
    }));

  const rank = (account: SwitchableAccount): Rank => {
    if (
      wanted &&
      normalizeEmail(account.email) === wanted &&
      (account.isCurrent || account.isFirefoxSignedIn)
    ) {
      return Rank.RequestedEmail;
    }
    if (account.isFirefoxSignedIn) {
      return Rank.FirefoxSignedIn;
    }
    if (account.isCurrent) {
      return Rank.Current;
    }
    return Rank.Other;
  };

  return switchable.sort((a, b) => {
    const byRank = rank(a) - rank(b);
    if (byRank !== 0) {
      return byRank;
    }
    // Per tier, so a requested or browser account is never demoted out of the
    // position it was asked for.
    if (a.hasSession !== b.hasSession) {
      return a.hasSession ? -1 : 1;
    }
    return (b.lastLogin ?? 0) - (a.lastLogin ?? 0);
  });
}
