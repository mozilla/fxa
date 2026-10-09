/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { hidesLoadingHeader } from './loading-header';

describe('hidesLoadingHeader', () => {
  it.each([
    { pathname: '/pair/supplicant/connect_this_device', isV2Handoff: false },
    { pathname: '/pair/supplicant/sync_success', isV2Handoff: true },
    { pathname: '/pair', isV2Handoff: true },
    { pathname: '/pair/', isV2Handoff: true },
  ])(
    'hides the header on $pathname (v2 handoff: $isV2Handoff)',
    ({ pathname, isV2Handoff }) => {
      expect(hidesLoadingHeader(pathname, isV2Handoff)).toBe(true);
    }
  );

  it.each([
    // A pairing link that is not v2 still lands on the legacy flow.
    { pathname: '/pair', isV2Handoff: false },
    // Pair sends browsers that cannot pair here, and the page shows the header.
    { pathname: '/pair/unsupported', isV2Handoff: true },
    { pathname: '/pair/failure', isV2Handoff: true },
    { pathname: '/pair/authority/scan_qr', isV2Handoff: true },
    { pathname: '/signin', isV2Handoff: false },
  ])(
    'keeps the header on $pathname (v2 handoff: $isV2Handoff)',
    ({ pathname, isV2Handoff }) => {
      expect(hidesLoadingHeader(pathname, isV2Handoff)).toBe(false);
    }
  );
});
