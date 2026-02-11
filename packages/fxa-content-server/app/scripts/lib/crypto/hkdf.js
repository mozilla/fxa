/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import importFxaCryptoDeriver from './deriver';
import required from '../required';

const HKDF_SHA_256 = 'HKDF-SHA-256';

/**
 * HKDF the Buffer `ikmBuffer` using `saltBuffer` and `infoBuffer`,
 * generating an output `length` bytes long.
 *
 * @param {Buffer} ikmBuffer - input key material
 * @param {Buffer} [saltBuffer] - salt
 * @param {Buffer} [infoBuffer] - info
 * @param {Number} [length=32]
 * @returns {Promise} resolves to output key material.
 */
export default (ikmBuffer, saltBuffer, infoBuffer, length = 32) => {
  return importFxaCryptoDeriver().then(({ jose }) => {
    required(ikmBuffer, 'ikmBuffer');

    const options = {
      info: infoBuffer,
      length,
      salt: saltBuffer,
    };

    return jose.JWA.derive(HKDF_SHA_256, ikmBuffer, options);
  });
};
