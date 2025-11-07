/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import GleanMetrics from './glean';

type DeviceExtras = {
  os_family: string;
  os_major: string;
  browser_family: string;
  browser_major: string;
  cpu_arm: boolean;
};

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
  // CPU architecture (best-effort)
  let cpu_arm = false;
  try {
    const anyNav: any = navigator;
    const arch = anyNav?.userAgentData?.architecture || '';
    if (arch) {
      cpu_arm = /arm/i.test(arch);
    } else {
      cpu_arm =
        /arm|aarch64/i.test(ua) ||
        // Apple Silicon heuristic
        (os_family === 'macos' && !/intel mac os x/i.test(ua));
    }
  } catch {
    // leave cpu_arm=false
  }
  return { os_family, os_major, browser_family, browser_major, cpu_arm };
}

/**
 * Fire-and-forget probe to record WebAuthn/passkey capabilities + device buckets.
 * - 10% sampled
 * - 30-day deduped
 * - gated on Glean upload being enabled
 */
export function maybeRecordWebAuthnCapabilities(samplingRate?: number) {
  // Only run client-side and if telemetry is enabled
  if (typeof window === 'undefined' || !GleanMetrics.getEnabled()) {
    return;
  }

  const rate =
    typeof samplingRate === 'number' && isFinite(samplingRate)
      ? samplingRate
      : 0.1;
  if (rate <= 0) {
    return;
  }
  // sampling
  if (Math.random() > rate) {
    return;
  }

  const storageKey = 'webauthn:caps:v1';
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

    let reason = '';

    if (!supportedApi) {
      reason = 's=0;no_getClientCapabilities';
    } else {
      try {
        // getClientCapabilities is proposal-stage; use `any` for forward-compat
        const caps = await (
          window as any
        ).PublicKeyCredential.getClientCapabilities();
        const ppa = !!caps?.passkeyPlatformAuthenticator;
        const cg = !!caps?.conditionalGet;
        const rel = !!caps?.relatedOrigins;
        const hyb = !!caps?.hybridTransport;
        const uvpa = !!caps?.userVerifyingPlatformAuthenticator;
        const prf = !!caps?.['extension:prf'];
        // Compact, non-PII payload encoded as a string
        reason = `s=1;ppa=${Number(ppa)};cg=${Number(cg)};rel=${Number(
          rel
        )};hyb=${Number(hyb)};uvpa=${Number(uvpa)};prf=${Number(prf)}`;
      } catch {
        reason = 's=0;error';
      }
    }

    try {
      if (reason.startsWith('s=1;')) {
        // parse the compact string we constructed to booleans for extras
        // s=1;ppa=0;cg=1;rel=0;hyb=1;uvpa=1;prf=0
        const parts = Object.fromEntries(
          reason.split(';').map((kv) => kv.split('='))
        ) as Record<string, string>;
        GleanMetrics.webauthn.capabilities({
          event: {
            supported: true,
            ppa: parts['ppa'] === '1',
            cg: parts['cg'] === '1',
            rel: parts['rel'] === '1',
            hyb: parts['hyb'] === '1',
            uvpa: parts['uvpa'] === '1',
            prf: parts['prf'] === '1',
            ...deviceExtras,
          },
        } as any);
      } else {
        GleanMetrics.webauthn.capabilities({
          event: {
            supported: false,
            error_reason: reason,
            ...deviceExtras,
          },
        } as any);
      }
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
