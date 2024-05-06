/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createPrivateKey, createPublicKey, JsonWebKey } from 'crypto';

export function pem2jwk(pem: string, extras?: Record<string, any>): JsonWebKey {
  if (pem.includes('PUBLIC')) {
    return Object.assign(
      createPublicKey({ key: pem }).export({ format: 'jwk' }),
      extras ?? {}
    );
  }
  return Object.assign(
    createPrivateKey({ key: pem }).export({ format: 'jwk' }),
    extras ?? {}
  );
}

export function jwk2pem(jwk: JsonWebKey): string {
  if (jwk.d) {
    return createPrivateKey({ key: jwk, format: 'jwk' })
      .export({
        format: 'pem',
        type: 'pkcs1',
      })
      .toString()
      .trim();
  }
  return createPublicKey({ key: jwk, format: 'jwk' })
    .export({
      format: 'pem',
      type: 'pkcs1',
    })
    .toString()
    .trim();
}
