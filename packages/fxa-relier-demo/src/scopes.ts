/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const SCOPED_KEY_SCOPE = 'https://identity.mozilla.com/apps/123done';

export type ScopeInfo = {
  scope: string;
  label: string;
  // userinfo fields this scope unlocks; empty when the scope grants something other than a claim
  claims: string[];
  note?: string;
};

// Claims per scope follow the profile-server route guards
// (packages/fxa-profile-server/lib/routes/*), plus `sub` from the openid scope.
export const SCOPE_CATALOGUE: ScopeInfo[] = [
  {
    scope: 'openid',
    label: 'OpenID',
    claims: ['sub'],
    note: 'also returns an id_token',
  },
  { scope: 'profile:uid', label: 'Account id', claims: ['uid'] },
  { scope: 'profile:email', label: 'Email', claims: ['email'] },
  {
    scope: 'profile:display_name',
    label: 'Display name',
    claims: ['displayName'],
  },
  {
    scope: 'profile:avatar',
    label: 'Avatar',
    claims: ['avatar', 'avatarDefault'],
  },
  { scope: 'profile:locale', label: 'Locale', claims: ['locale'] },
  {
    scope: 'profile:amr',
    label: 'Auth methods',
    claims: ['amrValues', 'twoFactorAuthentication'],
  },
  {
    scope: 'profile:subscriptions',
    label: 'Subscriptions',
    claims: ['subscriptions'],
  },
  {
    scope: 'profile',
    label: 'Full profile',
    claims: [],
    note: 'implies every profile:* scope',
  },
  {
    scope: SCOPED_KEY_SCOPE,
    label: 'Scoped key (123done)',
    claims: [],
    note: 'delivers an encryption key in keys_jwe',
  },
];

export type MatrixRow = {
  scope: string;
  requested: boolean;
  claims: { name: string; present: boolean }[];
};

/**
 * Cross the requested scopes with the catalogue and mark which claims
 * actually came back in the userinfo response.
 */
export function scopeMatrix(
  requested: string[],
  userinfo: Record<string, unknown> | null
): MatrixRow[] {
  const wantsProfile = requested.includes('profile');
  return SCOPE_CATALOGUE.filter((s) => s.claims.length > 0).map((s) => ({
    scope: s.scope,
    requested:
      requested.includes(s.scope) ||
      (wantsProfile && s.scope.startsWith('profile:')),
    claims: s.claims.map((name) => ({
      name,
      present: userinfo != null && userinfo[name] !== undefined,
    })),
  }));
}
