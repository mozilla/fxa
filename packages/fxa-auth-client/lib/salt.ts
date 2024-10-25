/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { uint8ToHex } from './utils';

/**
 * A prefix for all salt strings
 */
export const NAMESPACE = 'identity.mozilla.com/picl/v1/';

/**
 * Identifying mark indicating a v1 salt.
 */
export const V1_MARKER = 'quickStretch';

/**
 * Identifying mark indicating a v2 salt.
 */
export const V2_MARKER = 'quickStretchV2';

const NAMESPACE_REGEX_STR = '^identity\\.mozilla\\.com\\/picl\\/v1\\/';
const V1_REGEX_STR = `${NAMESPACE_REGEX_STR}${V1_MARKER}:`;
const V2_REGEX_STR = `${NAMESPACE_REGEX_STR}${V2_MARKER}:`;
const VX_REGEX_STR = `${V1_REGEX_STR}|${V2_REGEX_STR}`;

/**
 * Checks to see if salt value has a V1 prefix
 */
export const V1_REGEX = new RegExp(`${NAMESPACE_REGEX_STR}${V1_MARKER}:`);

/**
 * Checks to see if salt value has a V2 prefix
 */
export const V2_REGEX = new RegExp(`${NAMESPACE_REGEX_STR}${V2_MARKER}:`);

/**
 * Checks to see if the salt is a valid V1 or V2 prefix.
 */
export const VX_REGEX = new RegExp(VX_REGEX_STR);

/**
 * Set of valid salt versions
 */
export type SaltVersion = 1 | 2;

/**
 * The Salt model
 */
export interface Salt {
  /**
   * The namespace prefix
   */
  namespace?: string;

  /**
   * The version, which follows the names prefix
   */
  version?: number;

  /**
   * The salts potentially unique value.
   *  v1 - value is the email the user initially signed up with.
   *  v2 - value is a 16 byte 32 character random hex string created on signup or password reset.
   */
  value?: string;
}

/**
 * Parses and validates a salt string.
 * @param salt - A string representing the salt used for password encryption.
 *               v1 example: identity.mozilla.com/picl/v1/quickStretch:foo@mozillal.com
 *               v2 example: identity.mozilla.com/picl/v1/quickStretchV2:0123456789abcdef0123456789abcdef
 * @returns A Salt model
 */
export function parseSalt(salt: string): Salt {
  if (V2_REGEX.test(salt)) {
    return checkSalt({
      namespace: NAMESPACE,
      version: 2,
      value: salt.replace(V2_REGEX, ''),
    });
  }

  if (V1_REGEX.test(salt)) {
    return checkSalt({
      namespace: NAMESPACE,
      version: 1,
      value: salt.replace(V1_REGEX, ''),
    });
  }

  throw new Error('invalid salt format');
}

/**
 * Creates a v1 salt
 * @param email - Users email at time up account sign up.
 * @returns string - That has a valid salt format.
 *
 * For example, this could generate:
 *   identity.mozilla.com/picl/v1/quickStretchV2:foo@mozilla.org
 *
 * Where the portion after the prefix is the users email at time of sign up.
 */
export function createSaltV1(email: string) {
  const salt = `${NAMESPACE}${V1_MARKER}:${email}`;
  // Ensures salt will parse later!
  parseSalt(salt);
  return salt;
}

/**
 * Creates a v2 salt.
 * @returns string - That has a valid salt format.
 *
 * For example, this could generate:
 *   identity.mozilla.com/picl/v1/quickStretchV2:0123456789abcdef0123456789abcdef
 *
 * Where the portion after the prefix is a cryptographically secure random 32
 * character value comprised of hex.
 */
export function createSaltV2(value?: string) {
  if (value == null) {
    value = uint8ToHex(crypto.getRandomValues(new Uint8Array(16)));
  }

  if (!/^[a-f0-9]{32}$/.test(value || '')) {
    throw new Error(
      'Invalid v2 salt value. Must be 32 character random hex string.'
    );
  }
  const salt = `${NAMESPACE}${V2_MARKER}:${value}`;
  // Ensures salt is valid... just a sanity check.
  parseSalt(salt);
  return salt;
}

/**
 * Helper function for validating salt format after parsing.
 * @param salt - Incoming salt
 * @returns Salt - returns back the salt if it is valid.
 */
function checkSalt(salt: Salt): Salt {
  if (!salt.value) {
    throw new Error('salt value must be defined');
  }

  if (salt.namespace !== NAMESPACE) {
    throw new Error('salt must start with correct namespace');
  }

  if (!(salt.version === 1 || salt.version === 2)) {
    throw new Error('salt must have valid version');
  }

  // Validate that the salt value is reasonable
  if (salt.version === 1) {
    // There are already a lot checks on this input. This is just designed a basic sanity check
    if (!/.+@.+/.test(salt.value)) {
      throw new Error('salt value must be email like');
    }
  }
  if (salt.version === 2) {
    if (salt.value.length !== 32) {
      throw new Error('salt value must have length of 32');
    }
  }

  return salt;
}
