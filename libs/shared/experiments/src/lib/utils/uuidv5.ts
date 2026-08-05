/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createHash } from 'node:crypto';

// Mirrors the `uuid` package's validate(): version nibble 1-8, RFC 4122
// variant, plus the NIL and MAX special cases.
const UUID =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;

/**
 * Derive a version 5 (SHA-1, name-based) UUID, per RFC 4122 section 4.3.
 *
 * The output is deterministic: a given namespace and name always yield the same
 * UUID. `crypto.randomUUID()` is not a substitute — it is random, whereas
 * callers here depend on being able to re-derive an identifier they never
 * stored. See `generateNimbusId`.
 *
 * @param name arbitrary string, hashed as UTF-8
 * @param namespace a UUID string
 * @throws TypeError if `namespace` is not a valid UUID
 */
export function uuidv5(name: string, namespace: string): string {
  if (!UUID.test(namespace)) {
    throw new TypeError(`Invalid namespace UUID: ${namespace}`);
  }

  const bytes = createHash('sha1')
    .update(Buffer.from(namespace.replace(/-/g, ''), 'hex'))
    .update(Buffer.from(name, 'utf8'))
    .digest()
    .subarray(0, 16);

  bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant

  const hex = bytes.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}
