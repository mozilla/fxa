/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Every field of the envelope is fixed-width, and a wrong width is the failure
 * this module exists to catch early: stored at the wrong size, a field is
 * padded into its fixed-width column and can never be opened again.
 *
 * `name` is the envelope field name, so the message names the column an
 * operator would look at. Internal — deliberately not re-exported from
 * `index.ts`, like `suite.ts`.
 */
export function assertByteLength(
  name: string,
  value: Uint8Array,
  expected: number
): void {
  if (value.length !== expected) {
    throw new Error(`${name} must be ${expected} bytes, got ${value.length}`);
  }
}
