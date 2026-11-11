/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { hardNavigate } from 'fxa-react/lib/utils';
import GleanMetrics from '../glean';
import { flushGlean } from '../glean/flush';
import type { PairGleanReason } from '../glean/pair-reasons';

/**
 * Sends a pairing v2 browser to the scan QR screen. Full reload:
 * `useIntegration` is not keyed on location, so only a fresh page load
 * rebuilds it as a PairingAuthorityIntegration. The reload would drop the
 * redirect event, so it waits for the flush.
 */
export function goToScanQr(reason?: PairGleanReason) {
  GleanMetrics.cadFireFox.scanQrRedirect({ event: { reason } });
  const { pathname, search } = window.location;
  flushGlean().then(() => {
    // The user can leave (for example press Back) while the flush is pending.
    if (
      window.location.pathname === pathname &&
      window.location.search === search
    ) {
      hardNavigate('/pair/authority/scan_qr', {}, true);
    }
  });
}
