/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { isFunnelState } from './types';

describe('auth-machine types', () => {
  // Completeness (every state maps to a route) is covered by route-adapter's
  // "no gaps" test, which iterates FUNNEL_STATES; no need to restate the list here.
  it('isFunnelState narrows known states from unknown strings', () => {
    expect(isFunnelState('verifying.totp')).toBe(true);
    expect(isFunnelState('nope')).toBe(false);
  });
});
