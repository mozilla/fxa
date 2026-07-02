/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { routeFor } from './route-adapter';
import { FUNNEL_STATES } from './types';

describe('routeFor', () => {
  it.each([
    ['verifying.totp', '/signin_totp_code'],
    ['verifying.emailTokenCode', '/signin_token_code'],
    ['verifying.unblock', '/signin_unblock'],
    ['verifying.recoveryCode', '/signin_recovery_code'],
    ['verifying.recoveryPhone', '/signin_recovery_phone'],
    ['verifying.recoveryChoice', '/signin_recovery_choice'],
  ] as const)('maps %s → %s', (state, to) => {
    expect(routeFor(state)).toEqual({ to });
  });

  it('delegated state defers to legacy navigation', () => {
    expect(routeFor('delegated.legacy')).toEqual({ delegate: true });
  });

  it('every funnel state has a decision (no gaps)', () => {
    for (const s of FUNNEL_STATES) {
      expect(routeFor(s as any)).toBeDefined();
    }
  });
});
