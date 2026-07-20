/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Browser-side base64url helpers. fxa-settings ships in the browser bundle
// (no Node `Buffer`), so these build on `btoa`/`atob` rather than `Buffer`.

/**
 * Encodes binary data as an unpadded base64url string.
 *
 * Chunked so large inputs (e.g. a WebAuthn attestationObject) don't overflow
 * String.fromCharCode's argument list.
 */
export function bytesToBase64url(
  buffer: ArrayBuffer | ArrayBufferView
): string {
  // ArrayBuffer.isView, not `instanceof ArrayBuffer`: the latter is unreliable
  // across realms (iframes, workers), which would silently read zero bytes.
  const bytes = ArrayBuffer.isView(buffer)
    ? new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
    : new Uint8Array(buffer);
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decodes a base64url string (padded or unpadded) to bytes.
 */
export function base64urlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}
