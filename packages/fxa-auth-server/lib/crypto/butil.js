/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports.ONES = Buffer.from(
  'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  'hex'
);

module.exports.buffersAreEqual = function buffersAreEqual(buffer1, buffer2) {
  buffer1 = Buffer.from(buffer1, 'hex');
  buffer2 = Buffer.from(buffer2, 'hex');
  let mismatch = buffer1.length - buffer2.length;
  if (mismatch) {
    return false;
  }
  for (let i = 0; i < buffer1.length; i++) {
    mismatch |= buffer1[i] ^ buffer2[i];
  }
  return mismatch === 0;
};

module.exports.xorBuffers = function xorBuffers(buffer1, buffer2) {
  buffer1 = Buffer.from(buffer1, 'hex');
  buffer2 = Buffer.from(buffer2, 'hex');
  if (buffer1.length !== buffer2.length) {
    throw new Error(
      'XOR buffers must be same length (%d != %d)',
      buffer1.length,
      buffer2.length
    );
  }
  const result = Buffer.alloc(buffer1.length);
  for (let i = 0; i < buffer1.length; i++) {
    result[i] = buffer1[i] ^ buffer2[i];
  }
  return result;
};
