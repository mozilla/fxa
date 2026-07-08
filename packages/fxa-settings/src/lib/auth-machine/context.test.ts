/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { buildAuthContext } from './context';

const integration = {
  isSync: () => true,
  isFirefoxNonSync: () => false,
  type: 'OAuthNative',
  requiresKeys: () => true,
  wantsKeysIfPasswordEntered: () => false,
  wantsLogin: () => false,
  isOAuth: () => true,
} as any;

describe('buildAuthContext', () => {
  it('freezes Reliant capabilities from the integration', () => {
    const ctx = buildAuthContext({
      integration,
      stored: {
        email: 'user@example.com',
        hasPassword: true,
        sessionToken: 'abc',
      },
      live: {
        accountHasTotp: true,
        hasCachedSession: true,
        supportsKeysOptionalLogin: false,
      },
    });
    expect(ctx.isSync).toBe(true);
    expect(ctx.requiresKeys).toBe(true);
    expect(ctx.accountHasTotp).toBe(true);
    expect(ctx.email).toBe('user@example.com');
    expect(ctx.clientInfoLoadFailed).toBe(false);
  });
});
