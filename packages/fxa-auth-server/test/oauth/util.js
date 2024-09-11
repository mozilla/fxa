/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';

import util from '../../lib/oauth/util';

describe('util', function () {
  describe('base64URLEncode', function () {
    it('properly encodes', function () {
      var testBase64 =
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
        testBuffer = Buffer.from(testBase64, 'base64'),
        expectedBase64 = testBase64.replace('+', '-').replace('/', '_');

      assert.equal(util.base64URLEncode(testBuffer), expectedBase64);
    });
  });
});
