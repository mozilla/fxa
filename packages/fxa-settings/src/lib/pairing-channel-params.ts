/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Gets the pairing channel parameters out of the URL before anything can read
 * the URL and report it, and freezes them for the life of the page.
 *
 * Two separate reasons this exists.
 *
 * The fragment. Firefox opens the supplicant at
 * `/pair#channel_id=…&channel_key=…&v=2`, and `channel_key` is the pre-shared key
 * that encrypts the pairing channel. Glean's automatic instrumentation records
 * `window.location.href` — fragment included — as the `url` extra on its
 * page-load event and on *every* element-click event, so leaving the key in the
 * URL ships it to telemetry. It cannot be scrubbed at the Glean layer: glean.js
 * reads `href` itself inside `handleClickEvent`, so there is no seam to
 * substitute a sanitized value into. The fragment is therefore captured once and
 * removed from the URL.
 *
 * The channel id. It is the only value both devices in a pairing share, so it is
 * the join key for `session.pairing_channel_hash`. It has to be frozen at load,
 * not read live: the SPA can drop query params after load, and a metrics value
 * read from `location.search` later in the flow would stop matching the one
 * earlier events carried — the FXA-14093 failure, in the same shape.
 *
 * The captured values live in `sessionStorage`, a deliberate trade: the key stays
 * readable by any script on this origin, exactly as it was in the fragment, but
 * it is no longer part of the URL and so no longer reaches telemetry. Memory
 * alone would not do, because this flow reloads — a post-OAuth webview reload
 * (FXA-13616) has to find the channel still there.
 */

/** Namespaced so these cannot collide with the pair-complete markers. */
const HASH_STORAGE_KEY = 'fxa.pairing.channel.hash';
const CHANNEL_ID_STORAGE_KEY = 'fxa.pairing.channel.id';

/**
 * Presence of the key is what triggers stripping the fragment. Gating on it —
 * rather than on any fragment at all — keeps ordinary in-page anchors
 * (`#connected-services`, `#secondary-email`) untouched.
 */
const SECRET_PARAM = 'channel_key';

export type PairingChannelParams = {
  channelId: string;
  channelKey: string;
};

/** Serialized hash params, without the leading `#`. */
let hashSnapshot: string | null = null;
/** Resolved once at capture, never re-read from the URL. */
let channelIdSnapshot: string | null = null;

function read(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    // sessionStorage throws outright in some sandboxed WebViews.
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Unavailable storage degrades to in-memory only, which still covers
    // everything except a reload.
  }
}

/**
 * Capture the pairing channel, and strip the fragment carrying its key.
 *
 * Call once, before React renders, so it lands ahead of the `useLayoutEffect` in
 * App that initializes Glean — that effect runs before any child effect, so
 * stripping from inside the supplicant page would be too late for the first
 * page-load event, and resolving the channel id later would risk a URL that has
 * already been rewritten.
 *
 * Safe to call more than once and safe on a URL with no pairing params.
 */
export function capturePairingChannelParams(): void {
  const hash = window.location.hash.replace(/^#/, '');
  const hashParams = hash ? new URLSearchParams(hash) : null;

  if (hashParams?.has(SECRET_PARAM)) {
    hashSnapshot = hash;
    write(HASH_STORAGE_KEY, hash);

    // Keep the path and query exactly as they were; only the fragment goes.
    try {
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}${window.location.search}`
      );
    } catch {
      // If the URL cannot be rewritten the snapshot is still correct, so the
      // flow works — this run just keeps leaking the key to telemetry.
    }
  } else if (hashSnapshot === null) {
    // No fragment: either this is not a pairing URL, or we already stripped it
    // and the page has since reloaded.
    hashSnapshot = read(HASH_STORAGE_KEY);
  }

  // The authority carries the channel id as a query param; the supplicant has it
  // in the fragment captured just above.
  const resolved =
    new URLSearchParams(window.location.search).get('channel_id') ||
    getPairingChannelHashParams()?.get('channel_id') ||
    null;

  if (resolved) {
    channelIdSnapshot = resolved;
    write(CHANNEL_ID_STORAGE_KEY, resolved);
  } else if (channelIdSnapshot === null) {
    channelIdSnapshot = read(CHANNEL_ID_STORAGE_KEY);
  }
}

/**
 * The captured fragment as params, or null when this is not a pairing flow.
 * Falls back to storage so a reload before any capture still resolves.
 */
export function getPairingChannelHashParams(): URLSearchParams | null {
  const hash = hashSnapshot ?? read(HASH_STORAGE_KEY);
  return hash === null ? null : new URLSearchParams(hash);
}

/**
 * Write back to the capture instead of the URL. Nothing writes pairing params
 * today, but the store backing them exposes a generic `set()`, and routing it
 * here is what stops a future caller from quietly returning the key to the URL.
 */
export function updatePairingChannelHashParams(params: URLSearchParams): void {
  hashSnapshot = params.toString();
  write(HASH_STORAGE_KEY, hashSnapshot);
}

/** Whether a pairing channel was ever present in this tab's URL. */
export function hasPairingChannelParams(): boolean {
  return getPairingChannelHashParams() !== null;
}

/**
 * The two values the supplicant needs, or null when either is missing — callers
 * treat a partial fragment the same as no fragment at all.
 */
export function getPairingChannelParams(): PairingChannelParams | null {
  const params = getPairingChannelHashParams();
  const channelId = params?.get('channel_id');
  const channelKey = params?.get('channel_key');
  return channelId && channelKey ? { channelId, channelKey } : null;
}

/**
 * The channel id for this pairing, as resolved at page load. Null outside a
 * pairing flow.
 *
 * Deliberately never re-reads the URL — see the note on freezing above.
 */
export function getPairingChannelId(): string | null {
  return channelIdSnapshot ?? read(CHANNEL_ID_STORAGE_KEY);
}

/** Test seam. Not for production use. */
export function resetPairingChannelParamsForTest(): void {
  hashSnapshot = null;
  channelIdSnapshot = null;
  try {
    sessionStorage.removeItem(HASH_STORAGE_KEY);
    sessionStorage.removeItem(CHANNEL_ID_STORAGE_KEY);
  } catch {
    // nothing to reset
  }
}
