/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const solveLogin = require('../../lib/fido2/solveLogin');
const assert = require('assert');

describe("solve Login", () => {
  describe("loginChallengeToPublicKey", () => {
    it("challenge must be Buffer", () => {
      const getAssert = {
        challenge: 'fizz',
        allowCredentials: [
          {
            id: 'C0VGlvYFratUdAV1iCw-ULpUW8E-exHPXQChBfyVeJZCMfjMFcwDmOFgoMUz39LoMtCJUBW8WPlLkGT6q8qTCg',
            type: 'public-key',
            transports: ['nfc'],
          },
        ],
      };
      const challenge = (solveLogin.loginChallengeToPublicKey(getAssert)).challenge;
      assert.strictEqual(challenge instanceof Buffer, true);
    });
    it("id must be Buffer", () => {
      const getAssert = {
        challenge: 'fizz',
        allowCredentials: [
          {
            id: 'C0VGlvYFratUdAV1iCw-ULpUW8E-exHPXQChBfyVeJZCMfjMFcwDmOFgoMUz39LoMtCJUBW8WPlLkGT6q8qTCg',
            type: 'public-key',
            transports: ['nfc'],
          },
        ],
      };
      const id_ = (solveLogin.loginChallengeToPublicKey(getAssert)).allowCredentials;
      const id_buffer = id_.map(inner => Object.values(inner)[0])[0];
      assert.equal(id_buffer instanceof Buffer, true);
    });
  });
});
