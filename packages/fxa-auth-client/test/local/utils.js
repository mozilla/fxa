/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const utils = require('../../lib/fido2/utils');
const assert = require('assert');

describe("utils", () => {
  describe("publicKeyToJSON", () => {
    it("Check ArrayBuffer conversion", () => {
      const id = new Uint8Array([
        0x53, 0x68, 0x75, 0x62, 0x68, 0x61, 0x6d, 0x20, 0x4b, 0x75, 0x6d, 0x61, 0x72
      ]).buffer;
      const user = {
        id: id,
        name: "shubham@example.com",
        displayName: "Shubham Kumar"
      };
      const id_converted = utils.publicKeyToJSON(user).id;
      assert.strictEqual(id_converted, "U2h1YmhhbSBLdW1hcg==");
    });
    it("Check cred object", () => {
      const id = new Uint8Array([
        0x53, 0x68, 0x75, 0x62, 0x68, 0x61, 0x6d, 0x20, 0x4b, 0x75, 0x6d, 0x61, 0x72
      ]).buffer;
      const user = {
        id: id,
        name: "shubham@example.com",
        displayName: "Shubham Kumar"
      };
      const finalObject = {
        id: "U2h1YmhhbSBLdW1hcg==",
        name: "shubham@example.com",
        displayName: "Shubham Kumar",
      }
      assert.deepEqual(utils.publicKeyToJSON(user), finalObject);
    });
  });
});
