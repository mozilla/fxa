/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const util = require('./util');

describe('util', () => {
  describe('base64URLEncode', () => {
    it('properly encodes', () => {
      const testBase64 =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      const testBuffer = Buffer.from(testBase64, 'base64');
      const expectedBase64 = testBase64.replace('+', '-').replace('/', '_');

      expect(util.base64URLEncode(testBuffer)).toBe(expectedBase64);
    });
  });
});
