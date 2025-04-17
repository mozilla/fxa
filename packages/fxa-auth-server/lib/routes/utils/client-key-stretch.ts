/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Note should be aligned with fxa-auth-client/lib/crypt variables!
// Deciding not to create a dependency just for this. Also deciding not
// move to fxa-shared since fxa-auth-client does not currently depend on
// fxa-shared

// TBD - Should we move this to a nx lib, and use same routine for fxa-auth-client and fxa-auth-server?
//       Perhaps this better for a follow up.

export const V1_PBKDF2_ITERATIONS = 1000;
export const V2_PBKDF2_ITERATIONS = 650000;

export const NAMESPACE = 'identity.mozilla.com/picl/v1/';

export const V1_MARKER = 'quickStretch';
export const V2_MARKER = 'quickStretchV2';

const NAMESPACE_REGEX_STR = '^identity\\.mozilla\\.com\\/picl\\/v1\\/';
const V1_REGEX_STR = `${NAMESPACE_REGEX_STR}${V1_MARKER}:`;
const V2_REGEX_STR = `${NAMESPACE_REGEX_STR}${V2_MARKER}:`;
const VX_REGEX_STR = `${V1_REGEX_STR}|${V2_REGEX_STR}`;

export const V1_REGEX = new RegExp(V1_REGEX_STR);
export const V2_REGEX = new RegExp(V2_REGEX_STR);
export const VX_REGEX = new RegExp(VX_REGEX_STR);

export type Salt = {
  namespace?: typeof NAMESPACE;
  version?: 1 | 2;
  value?: string;
};

export function parseSalt(salt: string): Salt {
  if (V2_REGEX.test(salt)) {
    return {
      namespace: NAMESPACE,
      version: 2,
      value: salt.replace(V2_REGEX, ''),
    };
  }

  if (V1_REGEX.test(salt)) {
    return {
      namespace: NAMESPACE,
      version: 1,
      value: salt.replace(V1_REGEX, ''),
    };
  }

  throw new Error('invalid salt format');
}
