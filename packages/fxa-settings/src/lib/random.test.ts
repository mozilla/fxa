/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import random from './random';

jest.mock('./random', () => {
  const orig = jest.requireActual('./random');

  return orig;
});

describe('lib/random', () => {
  // mock the call to window.crypto since tests are running in node with jsdom
  const spy = jest
    .spyOn(random, 'getRandomBytes')
    .mockImplementation((len: number) => {
      const arr = new Uint32Array(len);
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.random() * Number.MAX_SAFE_INTEGER;
      }
      return arr;
    });

  afterAll(function () {
    spy.mockRestore();
  });

  type testcase = {
    name: string;
    generate: (len: number) => () => string;
    regexBase: RegExp;
    validCode: string;
    invalidCode: string;
  };

  const baseChecks: testcase[] = [
    {
      name: 'base10',
      generate: (len: number) => random.base10(len),
      regexBase: random.regexs.base10,
      validCode: '1234567890',
      invalidCode: 'ABC4567890',
    },
    {
      name: 'base16',
      generate: (len: number) => random.base32(len),
      regexBase: random.regexs.base16,
      validCode: 'ABC4567890',
      invalidCode: 'GHIJK67890',
    },
    {
      name: 'base32',
      generate: (len: number) => random.base32(len),
      regexBase: random.regexs.base32,
      validCode: 'ABC4567890',
      invalidCode: 'ILOU567890',
    },
    {
      name: 'base36',
      generate: (len: number) => random.base36(len),
      regexBase: random.regexs.base36,
      validCode: 'ILOU567890',
      invalidCode: 'ILOU5~7890',
    },
  ];

  for (const base of baseChecks) {
    const { name, generate, regexBase, validCode, invalidCode } = base;

    describe(`${name} checks`, () => {
      it('takes 1 integer argument, returns a function', () => {
        const gen = generate(10);
        assert.equal(typeof gen, 'function');
        assert.equal(gen.length, 0);
      });

      it('should have correct output', () => {
        const code = generate(10)();
        assert.equal(code.length, 10, 'matches length');
      });

      it('should check code with regex', async () => {
        assert.isTrue(regexBase.test(validCode), 'valid code for ' + name);
      });

      it('should detect invalid code with regex', () => {
        assert.isFalse(regexBase.test(invalidCode), 'invalid code for ' + name);
      });
    });
  }
});
