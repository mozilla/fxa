/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');

const random = require('../../../lib/crypto/random');
const base10 = random.base10;
const base32 = random.base32;

describe('random', () => {
  it('should generate random bytes', async () => {
    let bytes = await random(16);
    assert(Buffer.isBuffer(bytes));
    assert.equal(bytes.length, 16);

    bytes = await random(32);
    assert(Buffer.isBuffer(bytes));
    assert.equal(bytes.length, 32);
  });

  it('should generate several random bytes buffers', async () => {
    const bufs = await random(16, 8);
    assert.equal(bufs.length, 2);

    const a = bufs[0];
    const b = bufs[1];

    assert(Buffer.isBuffer(a));
    assert.equal(a.length, 16);

    assert(Buffer.isBuffer(b));
    assert.equal(b.length, 8);
  });

  describe('hex', () => {
    it('should generate a random hex string', async () => {
      let str = await random.hex(16);
      assert.equal(typeof str, 'string');
      assert(/^[0-9a-f]+$/g.test(str));
      assert.equal(str.length, 32);

      str = await random.hex(32);
      assert.equal(typeof str, 'string');
      assert.equal(str.length, 64);
    });

    it('should generate several random hex strings', async () => {
      const strs = await random.hex(16, 8);
      assert.equal(strs.length, 2);

      const a = strs[0];
      const b = strs[1];

      assert.equal(typeof a, 'string');
      assert(/^[0-9a-f]+$/g.test(a));
      assert.equal(a.length, 32);

      assert.equal(typeof b, 'string');
      assert(/^[0-9a-f]+$/g.test(b));
      assert.equal(b.length, 16);
    });
  });

  describe('base32', () => {
    it('takes 1 integer argument, returns a function', () => {
      assert.equal(typeof base32, 'function');
      assert.equal(base32.length, 1);
      const gen = base32(10);
      assert.equal(typeof gen, 'function');
      assert.equal(gen.length, 0);
    });

    it('should have correct output', async () => {
      const code = await base32(10)();
      assert.equal(code.length, 10, 'matches length');
      assert.ok(/^[0-9A-Z]+$/.test(code), 'no lowercase letters');
      assert.equal(code.indexOf('I'), -1, 'no I');
      assert.equal(code.indexOf('L'), -1, 'no L');
      assert.equal(code.indexOf('O'), -1, 'no O');
      assert.equal(code.indexOf('U'), -1, 'no U');
    });
  });

  describe('base10', () => {
    it('takes 1 integer argument, returns a function', () => {
      assert.equal(typeof base10, 'function');
      assert.equal(base10.length, 1);
      const gen = base10(10);
      assert.equal(typeof gen, 'function');
      assert.equal(gen.length, 0);
    });

    it('should have correct output', async () => {
      const code = await base10(10)();
      assert.equal(code.length, 10, 'matches length');
      assert.ok(/^[0-9]+$/.test(code), 'only digits');
    });
  });
});
