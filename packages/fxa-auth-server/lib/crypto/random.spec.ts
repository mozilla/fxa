/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import random from './random';

const base10 = random.base10;
const base32 = random.base32;

describe('random', () => {
  it('should generate random bytes', async () => {
    let bytes = await random(16);
    expect(Buffer.isBuffer(bytes)).toBe(true);
    expect(bytes.length).toBe(16);

    bytes = await random(32);
    expect(Buffer.isBuffer(bytes)).toBe(true);
    expect(bytes.length).toBe(32);
  });

  it('should generate several random bytes buffers', async () => {
    const bufs = await random(16, 8);
    expect(bufs).toHaveLength(2);

    const a = bufs[0];
    const b = bufs[1];

    expect(Buffer.isBuffer(a)).toBe(true);
    expect(a.length).toBe(16);

    expect(Buffer.isBuffer(b)).toBe(true);
    expect(b.length).toBe(8);
  });

  describe('hex', () => {
    it('should generate a random hex string', async () => {
      let str = await random.hex(16);
      expect(typeof str).toBe('string');
      expect(/^[0-9a-f]+$/g.test(str)).toBe(true);
      expect(str).toHaveLength(32);

      str = await random.hex(32);
      expect(typeof str).toBe('string');
      expect(str).toHaveLength(64);
    });

    it('should generate several random hex strings', async () => {
      const strs = await random.hex(16, 8);
      expect(strs).toHaveLength(2);

      const a = strs[0];
      const b = strs[1];

      expect(typeof a).toBe('string');
      expect(/^[0-9a-f]+$/g.test(a)).toBe(true);
      expect(a).toHaveLength(32);

      expect(typeof b).toBe('string');
      expect(/^[0-9a-f]+$/g.test(b)).toBe(true);
      expect(b).toHaveLength(16);
    });
  });

  describe('base32', () => {
    it('takes 1 integer argument, returns a function', () => {
      expect(typeof base32).toBe('function');
      expect(base32.length).toBe(1);
      const gen = base32(10);
      expect(typeof gen).toBe('function');
      expect(gen.length).toBe(0);
    });

    it('should have correct output', async () => {
      const code = await base32(10)();
      expect(code).toHaveLength(10);
      expect(/^[0-9A-Z]+$/.test(code)).toBe(true);
      expect(code.indexOf('I')).toBe(-1);
      expect(code.indexOf('L')).toBe(-1);
      expect(code.indexOf('O')).toBe(-1);
      expect(code.indexOf('U')).toBe(-1);
    });
  });

  describe('base10', () => {
    it('takes 1 integer argument, returns a function', () => {
      expect(typeof base10).toBe('function');
      expect(base10.length).toBe(1);
      const gen = base10(10);
      expect(typeof gen).toBe('function');
      expect(gen.length).toBe(0);
    });

    it('should have correct output', async () => {
      const code = await base10(10)();
      expect(code).toHaveLength(10);
      expect(/^[0-9]+$/.test(code)).toBe(true);
    });
  });
});
