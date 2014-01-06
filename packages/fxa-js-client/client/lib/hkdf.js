/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
define(['../vendor/sjcl', '../../components/p/p'], function (sjcl, P) {
  'use strict';

  /**
   * hkdf - The HMAC-based Key Derivation Function
   * based on https://github.com/mozilla/node-hkdf
   *
   * @class hkdf
   * @param {bitArray} ikm Initial keying material
   * @param {bitArray} info Key derivation data
   * @param {bitArray} salt Salt
   * @param {integer} length Length of the derived key in bytes
   * @return promise object- It will resolve with `output` data
   */
  function hkdf(ikm, info, salt, length) {

    var mac = new sjcl.misc.hmac(salt, sjcl.hash.sha256);
    mac.update(ikm);

    // compute the PRK
    var prk = mac.digest();

    var buffers = [];
    // hash length is 32 because only sjcl.hash.sha256 is used at this moment
    var hashLength = 32;
    var num_blocks = Math.ceil(length / hashLength);
    var prev = sjcl.codec.hex.toBits('');

    for (var i=0; i < num_blocks; i++) {
      var hmac = new sjcl.misc.hmac(prk, sjcl.hash.sha256);

      var input = sjcl.bitArray.concat(
        sjcl.bitArray.concat(prev, info),
        sjcl.codec.utf8String.toBits((String.fromCharCode(i + 1)))
      );

      hmac.update(input);

      prev = hmac.digest();
      buffers.push(prev);
    }

    var output = buffers[0];
    if (buffers.length > 1) {
      output = sjcl.bitArray.concat.apply(null, buffers);
    }

    var truncated = sjcl.bitArray.clamp(output, length * 8);

    return P(truncated);
  }

  return hkdf;

});
