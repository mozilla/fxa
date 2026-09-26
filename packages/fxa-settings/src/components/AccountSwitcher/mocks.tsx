/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SwitchableAccount } from '../../lib/account-switcher';

/**
 * A distinct avatar per account without adding image assets to the repo.
 * `Avatar` renders an `<img src>`, which accepts a data URI.
 */
export const mockAvatarUrl = (initial: string, background: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="${background}"/><text x="50%" y="50%" dy="0.35em" text-anchor="middle" font-family="sans-serif" font-size="38" fill="#ffffff">${initial}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const mockAvatar = (initial: string, background: string) => ({
  id: `avatar-${initial.toLowerCase()}`,
  url: mockAvatarUrl(initial, background),
});

export const mockSwitchableAccount = (
  overrides: Partial<SwitchableAccount> = {}
): SwitchableAccount => ({
  uid: 'uid-abc',
  email: 'user@example.com',
  displayName: null,
  avatar: null,
  hasSession: true,
  isCurrent: false,
  isFirefoxSignedIn: false,
  isLastUsedForClient: false,
  lastLogin: 1000,
  ...overrides,
});

export const mockSwitchableAccounts = (count: number): SwitchableAccount[] =>
  Array.from({ length: count }, (_, i) =>
    mockSwitchableAccount({
      uid: `uid-${i}`,
      email: `user${i}@example.com`,
      lastLogin: 1000 - i,
    })
  );
