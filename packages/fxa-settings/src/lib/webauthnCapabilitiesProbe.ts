/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import GleanMetrics from './glean';

type DeviceExtras = {
  os_family?: string;
  os_major?: string;
  browser_family?: string;
  browser_major?: string;
};

export type WebAuthnExtras = {
  cg?: string;
  error_reason?: string;
  hyb?: string;
  ppa?: string;
  prf?: string;
  rel?: string;
  supported?: string;
  uvpa?: string;
} & DeviceExtras;

function getDeviceExtras(): DeviceExtras {
  const ua = navigator.userAgent || '';
  const uaLower = ua.toLowerCase();
  // Browser family + major
  let browser_family = 'other';
  let browser_major = 'other';
  const browserMatchers: Array<[string, RegExp]> = [
    ['firefox', /firefox\/(\d+)/i],
    ['edge', /edg\/(\d+)/i],
    ['chrome', /chrome\/(\d+)/i],
    ['safari', /version\/(\d+).+safari/i],
  ];
  for (const [family, re] of browserMatchers) {
    const m = ua.match(re);
    if (m) {
      browser_family = family;
      browser_major = m[1] || 'other';
      break;
    }
  }
  // OS family + major bucket
  let os_family = 'other';
  let os_major = 'other';
  if (uaLower.includes('windows nt')) {
    os_family = 'windows';
    const m = ua.match(/Windows NT (\d+)\.(\d+)/i);
    if (m) os_major = m[1];
  } else if (uaLower.includes('android')) {
    os_family = 'android';
    const m = ua.match(/Android (\d+)/i);
    if (m) os_major = m[1];
  } else if (uaLower.includes('iphone os') || uaLower.includes('cpu os')) {
    os_family = 'ios';
    const m = ua.match(/OS (\d+)_/i);
    if (m) os_major = m[1];
  } else if (uaLower.includes('mac os x')) {
    os_family = 'macos';
    const m = ua.match(/Mac OS X (\d+)[._]/i);
    if (m) os_major = m[1];
  } else if (uaLower.includes('cros')) {
    os_family = 'chromeos';
    const m = ua.match(/CrOS [^ ]+ (\d+)\./i);
    if (m) os_major = m[1];
  } else if (uaLower.includes('linux')) {
    os_family = 'linux';
  }
  return { os_family, os_major, browser_family, browser_major };
}

/**
 * Fire-and-forget probe to record WebAuthn/passkey capabilities + device buckets.
 * - 30-day deduped
 * - gated on Glean upload being enabled
 */
export function maybeRecordWebAuthnCapabilities() {
  // Only run client-side and if telemetry is enabled
  if (typeof window === 'undefined' || !GleanMetrics.getEnabled()) {
    return;
  }

  const storageKey = 'webauthn:caps:v2';
  try {
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const last = Number(window.localStorage.getItem(storageKey) || 0);
    if (last && Date.now() - last < thirtyDaysMs) {
      return;
    }
  } catch {
    // ignore storage errors (Safari ITP, etc.)
  }

  (async () => {
    const deviceExtras = getDeviceExtras();
    const supportedApi =
      'PublicKeyCredential' in window &&
      typeof (window as any).PublicKeyCredential?.getClientCapabilities ===
        'function';

    let eventExtras: WebAuthnExtras;
    eventExtras = {
      os_family: deviceExtras.os_family,
      os_major: deviceExtras.os_major,
      browser_family: deviceExtras.browser_family,
      browser_major: deviceExtras.browser_major,
    };

    if (!supportedApi) {
      eventExtras.supported = 'false';
      eventExtras.error_reason = 'no_getClientCapabilities';
    } else {
      try {
        // getClientCapabilities is proposal-stage; use `any` for forward-compat
        const caps = await (
          window as any
        ).PublicKeyCredential.getClientCapabilities();
        eventExtras.supported = 'true';
        eventExtras.ppa = String(!!caps?.passkeyPlatformAuthenticator);
        eventExtras.cg = String(!!caps?.conditionalGet);
        eventExtras.rel = String(!!caps?.relatedOrigins);
        eventExtras.hyb = String(!!caps?.hybridTransport);
        eventExtras.uvpa = String(!!caps?.userVerifyingPlatformAuthenticator);
        eventExtras.prf = String(!!caps?.['extension:prf']);
      } catch {
        // If capabilities query fails, still emit a fallback event
        eventExtras.supported = 'false';
        eventExtras.error_reason = 'error';
      }
    }

    try {
      GleanMetrics.webauthn.capabilities({
        event: eventExtras,
      } as any);
    } catch {
      // swallow telemetry errors
    }

    try {
      window.localStorage.setItem(storageKey, String(Date.now()));
    } catch {
      // ignore storage errors
    }
  })();
}
