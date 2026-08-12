/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Carries attribution query params across the browser-initiated hand-off in the
 * device pairing flow.
 *
 * The desktop `/pair` page is opened by Firefox with an entrypoint
 * (send-tab-*`, fxa_app_menu, etc). Clicking through sends the
 * `fxaccounts:pair_preferences` WebChannel command and control passes to browser
 * chrome, which renders the pairing QR code.
 *
 * When the supplicant connects, Firefox opens a brand-new top-level navigation to
 * `/oauth?client_id=…&scope=…&email=…&uid=…&channel_id=…&redirect_uri=urn:…oob:pair-auth-webchannel`
 * This has six params, none of them attribution. So the authority approval page has no
 * entrypoint to propagate and `session.entrypoint` is empty on
 * `cad_approve_device.view` abd submit.
 */

import Storage from './storage';
import { Constants } from './constants';

let storageInstance: Storage | undefined;
function storage(): Storage {
  if (storageInstance === undefined) {
    storageInstance = Storage.factory('localStorage');
  }
  return storageInstance;
}

/**
 * Attribution query params carried from `/pair` to the pairing-authority pages.
 * These are exactly the params Glean reads off the integration data
 * (see `lib/glean/index.ts` `initMetrics()`).
 */
export const PAIRING_ATTRIBUTION_PARAMS = [
  'entrypoint',
  'entrypoint_experiment',
  'entrypoint_variation',
  'utm_campaign',
  'utm_content',
  'utm_medium',
  'utm_source',
  'utm_term',
] as const;

export const PAIRING_ATTRIBUTION_STORAGE_KEY = 'pairing_attribution';

/**
 * How long a stashed hand-off stays valid. The journey is `/pair` → Firefox's
 * pairing dialog → (possibly install Firefox on the phone) → scan → approve, so
 * this needs to tolerate tens of minutes. Keeping it inside one plausible session
 * bounds how long a *later* pairing started straight from `about:preferences`
 * could be mis-attributed to the earlier one.
 */
export const PAIRING_ATTRIBUTION_TTL_MS = 30 * 60 * 1000;

export type PairingAttributionParam =
  (typeof PAIRING_ATTRIBUTION_PARAMS)[number];

export type PairingAttribution = Partial<
  Record<PairingAttributionParam, string>
>;

type StoredPairingAttribution = {
  params: PairingAttribution;
  createdAt: number;
};

/**
 * True when this search string is the Fx Desktop pairing-authority entry point.
 *
 * Mirrors `DefaultIntegrationFlags.isDevicePairingAsAuthority()` in
 * `lib/integrations/integration-factory-flags.ts` — kept as a pure function over a
 * search string so it can run at bootstrap, before any `ModelDataStore` exists.
 * Keep the two in sync.
 */
export function isPairingAuthoritySearch(search: string): boolean {
  return (
    new URLSearchParams(search).get('redirect_uri') ===
    Constants.DEVICE_PAIRING_AUTHORITY_REDIRECT_URI
  );
}

/** Picks the attribution params out of a search string. */
export function pickPairingAttribution(search: string): PairingAttribution {
  const params = new URLSearchParams(search);
  const picked: PairingAttribution = {};

  for (const name of PAIRING_ATTRIBUTION_PARAMS) {
    const value = params.get(name);
    if (value) {
      picked[name] = value;
    }
  }

  // Fx Desktop declares both `entryPoint` (capital P) and `entrypoint`.
  // `IntegrationFactory.initIntegration()` lets the capital P value win.
  const entryPoint = params.get('entryPoint');
  if (entryPoint) {
    picked.entrypoint = entryPoint;
  }

  return picked;
}

/**
 * The integration data fields that correspond to the attribution params.
 */
export type PairingAttributionData = {
  entrypoint?: string;
  entrypointExperiment?: string;
  entrypointVariation?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmMedium?: string;
  utmSource?: string;
  utmTerm?: string;
};

const DATA_FIELD_BY_PARAM: Record<
  PairingAttributionParam,
  keyof PairingAttributionData
> = {
  entrypoint: 'entrypoint',
  entrypoint_experiment: 'entrypointExperiment',
  entrypoint_variation: 'entrypointVariation',
  utm_campaign: 'utmCampaign',
  utm_content: 'utmContent',
  utm_medium: 'utmMedium',
  utm_source: 'utmSource',
  utm_term: 'utmTerm',
};

/**
 * Picks the attribution params off an integration's data.
 *
 * Preferred over reading the URL directly! The integration is what the page's
 * own Glean events attribute with, so stashing the same value keeps `/pair` and
 * the approval page reporting one entrypoint. It has also already normalized
 * `entryPoint` → `entrypoint`.
 */
export function pickPairingAttributionFromData(
  data: PairingAttributionData
): PairingAttribution {
  const picked: PairingAttribution = {};

  for (const name of PAIRING_ATTRIBUTION_PARAMS) {
    const value = data[DATA_FIELD_BY_PARAM[name]];
    if (value) {
      picked[name] = value;
    }
  }

  return picked;
}

/**
 * Persists attribution params for the pairing-authority page to pick up.
 * No-op when there is nothing to carry.
 */
export function stashPairingAttribution(
  params: PairingAttribution,
  now: number = Date.now()
): void {
  if (Object.keys(params).length === 0) {
    return;
  }

  const stored: StoredPairingAttribution = { params, createdAt: now };
  try {
    storage().set(PAIRING_ATTRIBUTION_STORAGE_KEY, stored);
  } catch {
    // localStorage may be unavailable (disabled, private browsing, etc.)
  }
}

/**
 * Reads the stashed attribution params. Returns an empty object when absent,
 * expired, or malformed.
 *
 * Deliberately does not clear the stash — a second approval page load in the same
 * session must report the same attribution, otherwise `.view` and `.submit` would
 * disagree.
 */
export function readPairingAttribution(
  now: number = Date.now()
): PairingAttribution {
  let stored: StoredPairingAttribution | undefined;
  try {
    stored = storage().get(PAIRING_ATTRIBUTION_STORAGE_KEY);
  } catch {
    // localStorage may be unavailable
  }

  if (
    !stored ||
    typeof stored.createdAt !== 'number' ||
    typeof stored.params !== 'object' ||
    stored.params === null
  ) {
    return {};
  }

  if (now - stored.createdAt >= PAIRING_ATTRIBUTION_TTL_MS) {
    return {};
  }

  // Only trust the params we recognise — the stash is user-writable storage.
  const params: PairingAttribution = {};
  for (const name of PAIRING_ATTRIBUTION_PARAMS) {
    const value = stored.params[name];
    if (typeof value === 'string' && value) {
      params[name] = value;
    }
  }

  return params;
}

/**
 * Merges `stashed` into `search`, defaulting `entrypoint` so the approval page
 * always reports one. Params already present in the URL always win.
 *
 * Appends to the existing query string rather than re-serializing it:
 * `public/query-fix.js` has already normalized these params with
 * `encodeURIComponent`, and `URLSearchParams.toString()` uses form encoding
 * (space → `+`), so a round-trip would silently rewrite params we don't own.
 *
 * @returns the new search string (with a leading `?`), or null when nothing
 * should change.
 */
export function applyPairingAttribution(
  search: string,
  stashed: PairingAttribution
): string | null {
  if (!isPairingAuthoritySearch(search)) {
    return null;
  }

  const existing = new URLSearchParams(search);
  const additions: string[] = [];

  for (const name of PAIRING_ATTRIBUTION_PARAMS) {
    const value = stashed[name];

    // Important, only backfill missing query parameters. Never overwrite them!
    if (value && !existing.get(name)) {
      additions.push(`${name}=${encodeURIComponent(value)}`);
    }
  }

  // Handle about:preferences edge case
  if (!existing.get('entrypoint') && !stashed.entrypoint) {
    // Nothing was stashed, so pairing was started straight from Firefox's
    // about:preferences dialog rather than from /pair.
    additions.push(
      `entrypoint=${encodeURIComponent(
        Constants.FIREFOX_PREFERENCES_ENTRYPOINT
      )}`
    );
  }

  if (additions.length === 0) {
    return null;
  }

  const base = search.startsWith('?') ? search.slice(1) : search;
  return `?${base ? `${base}&` : ''}${additions.join('&')}`;
}

/**
 * Bootstrap step: restores the pairing attribution params onto the current URL.
 *
 * Must run before the router mounts and before any `UrlQueryData` is built —
 * `UrlQueryData` writes via a raw `history.replaceState` that react-router never
 * observes, so a later write would be clobbered by the first
 * `navigateWithQuery()`. Mirrors `public/query-fix.js`.
 *
 * @returns whether the URL was rewritten. Never throws.
 */
export function restorePairingAttribution(
  win: Window = window,
  now: number = Date.now()
): boolean {
  try {
    const url = new URL(win.location.href);

    // Bail before touching storage: this runs on every page load, and
    // Storage.factory() probes localStorage with a write/remove.
    if (!isPairingAuthoritySearch(url.search)) {
      return false;
    }

    const search = applyPairingAttribution(
      url.search,
      readPairingAttribution(now)
    );

    if (search === null) {
      return false;
    }

    // Rebuild from href so pathname and hash survive the rewrite.
    url.search = search;
    win.history.replaceState(win.history.state, '', url.toString());
    return true;
  } catch {
    // This runs before the app renders; a throw here would blank the page.
    return false;
  }
}
