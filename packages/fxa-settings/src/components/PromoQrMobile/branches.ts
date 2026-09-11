/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import controlQr from './qr/control.svg';
import { isFxaHostedUrl } from '../../lib/utilities';

export const CONTROL_BRANCH = 'control';

/** The control QR, shown to everyone outside the experiment. */
export { controlQr };

export type PromoQrFeature = {
  enabled?: boolean;
  branch?: string;
  heading?: string;
  description?: string;
  qrUrl?: string;
};

export type ResolvedPromo = {
  /** The arm telemetry reports. Undefined when the user is not enrolled. */
  slug?: string;
  /**
   * Experimenter copy, English as authored. Undefined falls back to the Fluent
   * control string, which is the only translated copy the promo has.
   */
  heading?: string;
  description?: string;
  qr: string;
};

/**
 * Resolve the arm to the content it shows.
 *
 * Each field falls back independently, so a branch that sets a heading but no
 * QR still shows its heading over the control QR. A branch that sets nothing
 * renders as the control while still reporting its slug, which is what
 * distinguishes an enrolled control from untouched traffic.
 */
export function resolvePromo(
  feature: PromoQrFeature | undefined,
  enrolled: boolean,
  allowedQrOrigins: string[]
): ResolvedPromo {
  if (!enrolled || !feature) {
    return { qr: controlQr };
  }

  return {
    slug: feature.branch || CONTROL_BRANCH,
    heading: feature.heading || undefined,
    description: feature.description || undefined,
    qr: isFxaHostedUrl(feature.qrUrl, allowedQrOrigins)
      ? feature.qrUrl
      : controlQr,
  };
}

/**
 * The origins an experiment QR may be served from: the app's own origin, plus
 * the asset CDN. Returns just the app origin when the CDN base is unset or
 * unparseable, which keeps the check closed rather than open.
 */
export function allowedQrOrigins(cdnBaseUrl?: string): string[] {
  const origins = [window.location.origin];
  try {
    if (cdnBaseUrl) {
      origins.push(new URL(cdnBaseUrl).origin);
    }
  } catch {
    // An unparseable base leaves the app origin as the only allowed one.
  }
  return origins;
}
