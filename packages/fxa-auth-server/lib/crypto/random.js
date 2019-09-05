/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const assert = require('assert');
const randomBytes = require('util').promisify(require('crypto').randomBytes);

const BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const BASE10 = '0123456789';

// some sanity checks, hard to test, private to this mdoule
assert.equal(BASE32.length, 32, 'ALPHABET is 32 characters');
assert.equal(BASE32.indexOf('I'), -1, 'should not contain I');
assert.equal(BASE32.indexOf('L'), -1, 'should not contain L');
assert.equal(BASE32.indexOf('O'), -1, 'should not contain O');
assert.equal(BASE32.indexOf('U'), -1, 'should not contain U');

async function random(bytes) {
  if (arguments.length > 1) {
    bytes = Array.from(arguments);
    const sum = bytes.reduce((acc, val) => acc + val, 0);
    const buf = await randomBytes(sum);
    let pos = 0;
    return bytes.map(num => {
      const slice = buf.slice(pos, pos + num);
      pos += num;
      return slice;
    });
  } else {
    return randomBytes(bytes);
  }
}

random.hex = async function hex() {
  const bufs = await random.apply(null, arguments);
  if (Array.isArray(bufs)) {
    return bufs.map(buf => buf.toString('hex'));
  } else {
    return bufs.toString('hex');
  }
};

async function randomValue(base, len) {
  // To minimize bias in element selection, we generate a
  // 32-bit unsigned int for each element and map it to a float in [0,1).
  // This requires 4 bytes of randomness per element.
  const bytes = await random(len * 4);
  const out = [];

  for (let i = 0; i < len; i++) {
    const r = bytes.readUInt32BE(4 * i) / 2 ** 32;
    out.push(base[Math.floor(r * base.length)]);
  }

  return out.join('');
}

random.base10 = function(len) {
  return () => randomValue(BASE10, len);
};

random.base32 = function(len) {
  return () => randomValue(BASE32, len);
};

module.exports = random;
