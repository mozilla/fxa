/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Vendored from the shared FxA lib (@fxa/shared/pem-jwk) so 123done stays
// self-contained and deployable without the monorepo.

'use strict';

const { createPrivateKey, createPublicKey } = require('crypto');

function pem2jwk(pem, extras) {
  if (pem.includes('PUBLIC')) {
    return Object.assign(
      createPublicKey({ key: pem }).export({ format: 'jwk' }),
      extras || {}
    );
  }
  return Object.assign(
    createPrivateKey({ key: pem }).export({ format: 'jwk' }),
    extras || {}
  );
}

function jwk2pem(jwk) {
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

module.exports = { pem2jwk, jwk2pem };
