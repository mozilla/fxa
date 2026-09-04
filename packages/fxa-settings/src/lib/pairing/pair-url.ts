/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The pairing channel URL, in both directions: the authority builds one into
 * its QR code, and the supplicant reads it back out of the URL it was opened
 * with. Both live here so the two can never drift — a mismatch between the
 * string we encode and the string we parse only shows up on a real device,
 * with a scanned QR, which is the most expensive place to find a bug.
 */

/**
 * The pairing channel the authority encodes into its QR code.
 */
export type PairingChannelInfo = {
  channelId: string;
  channelKey: string;
  version: '1' | '2';
};

/**
 * Both halves of the channel are base64url, the same shape content-server's
 * `Vat.channelId()` / `Vat.channelKey()` accept.
 */
const BASE64URL = /^[A-Za-z0-9-_]+$/;

/** Comfortably above a real channel id or key, well below any useful payload. */
const MAX_CHANNEL_VALUE_LENGTH = 128;

/**
 * The hash arrives from a scanned QR code, so it is attacker-supplied, and it is
 * interpolated raw into the Android `intent://...#Intent;...;end` deep link in
 * `handoff.ts`. A `;` or `#` would close the URL and open a new intent extra,
 * letting a crafted QR override `package` or `S.browser_fallback_url` and send
 * the user to an app or store page of its choosing. Allowlisting base64url
 * rejects those, and every other character the deep link cannot carry, without
 * having to enumerate them.
 */
function isSafeChannelValue(value: string): boolean {
  return value.length <= MAX_CHANNEL_VALUE_LENGTH && BASE64URL.test(value);
}

/**
 * Is this a v2 pairing channel we are willing to act on?
 *
 * The channel reaches us two ways — parsed out of the URL hash here, and handed
 * between pages as router state — and both end up interpolated into a deep
 * link, so both are validated through this one guard rather than trusting the
 * shape of whatever arrived.
 */
export function isPairingChannelInfo(
  value: unknown
): value is PairingChannelInfo {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const { channelId, channelKey, version } = value as Record<string, unknown>;
  return (
    version === '2' &&
    typeof channelId === 'string' &&
    typeof channelKey === 'string' &&
    isSafeChannelValue(channelId) &&
    isSafeChannelValue(channelKey)
  );
}

/**
 * Read a v2 pairing channel out of a URL hash, as produced by the authority's
 * QR code: `/pair#channel_id=...&channel_key=...&v=2`. The channel lives in the
 * hash rather than the query string so the key is never sent to the server.
 *
 * Returns undefined unless the hash names version 2 and carries both halves of
 * the channel, each well-formed — half a channel cannot be opened, and a
 * malformed one cannot be trusted, so both are treated as no hand-off at all
 * rather than as a broken one.
 */
export function parsePairingHash(
  hash?: string
): PairingChannelInfo | undefined {
  const params = new URLSearchParams((hash ?? '').replace(/^#/, ''));

  const candidate = {
    channelId: params.get('channel_id'),
    channelKey: params.get('channel_key'),
    version: params.get('v'),
  };

  return isPairingChannelInfo(candidate) ? candidate : undefined;
}

/**
 * The URL the authority puts in its QR code, and the URL the supplicant deep
 * links back into Firefox with. `origin` is injectable for tests; it defaults
 * to the current one.
 */
export function buildPairUrl(
  { channelId, channelKey, version }: PairingChannelInfo,
  origin: string = window.location.origin
): string {
  return (
    `${origin}/pair` +
    `#channel_id=${channelId}` +
    `&channel_key=${channelKey}` +
    `&v=${version}`
  );
}
