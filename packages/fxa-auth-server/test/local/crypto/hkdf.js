/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const hkdf = require('../../../lib/crypto/hkdf');

describe('hkdf', () => {
  it('should extract', () => {
    let stretchedPw =
      'c16d46c31bee242cb31f916e9e38d60b76431d3f5304549cc75ae4bc20c7108c';
    stretchedPw = Buffer.from(stretchedPw, 'hex');
    const info = 'mainKDF';
    const salt = Buffer.from(
      '00f000000000000000000000000000000000000000000000000000000000034d',
      'hex'
    );
    const lengthHkdf = 2 * 32;

    return hkdf(stretchedPw, info, salt, lengthHkdf).then((hkdfResult) => {
      const hkdfStr = hkdfResult.toString('hex');

      assert.equal(
        hkdfStr.substring(0, 64),
        '00f9b71800ab5337d51177d8fbc682a3653fa6dae5b87628eeec43a18af59a9d'
      );
      assert.equal(
        hkdfStr.substring(64, 128),
        '6ea660be9c89ec355397f89afb282ea0bf21095760c8c5009bbcc894155bbe2a'
      );
      assert.equal(
        salt.toString('hex'),
        '00f000000000000000000000000000000000000000000000000000000000034d'
      );
    });
  });
});
