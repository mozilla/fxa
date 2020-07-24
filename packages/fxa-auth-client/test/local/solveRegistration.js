/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const solveRegist = require('../../lib/fido2/solveRegistration');
const assert = require('assert');
const sinon = require('sinon');

describe("solve Registration", () => {
  describe("registrationChallengeToPublicKey", () => {
    it("challenge must be Buffer", () => {
      const create = {
        challenge: "sP4MiwodjreC8-80IMjcyWNlo_Y1SJXmFgQNBilnjdf30WRsjFDhDYmfY4-4uhq2HFjYREbXdr6Vjuvz2XvTjA==",
        user: {
            id: "YWRhbQ==",
            displayName: "Shubham Kumar",
            name: "skr"
        },
        pubKeyCredParams: [{
            alg: -7,
            type: "public-key"
        }]
      };
      const challenge = (solveRegist.registrationChallengeToPublicKey(create)).challenge;
      assert.strictEqual(challenge instanceof Buffer, true);
    });
    it("id must be Buffer", () => {
      const create = {
        challenge: "sP4MiwodjreC8-80IMjcyWNlo_Y1SJXmFgQNBilnjdf30WRsjFDhDYmfY4-4uhq2HFjYREbXdr6Vjuvz2XvTjA==",
        user: {
            id: "YWRhbQ==",
            displayName: "Shubham Kumar",
            name: "skr"
        },
        pubKeyCredParams: [{
            alg: -7,
            type: "public-key"
        }]
      };
      const id_ = (solveRegist.registrationChallengeToPublicKey(create)).user["id"];
      assert.equal(id_ instanceof Buffer, true);
    });
  });
  describe("solveRegistration using navigator", () => {
    global.window = {
      navigator: {
        credentials: {
          create: () => Promise.resolve({
            // return mock object
          })
        }
      }
    };
    beforeEach(() => {
      const sandbox = sinon.createSandbox();
      sandbox.stub(window.navigator.credentials, 'create');
    });
    it("mock navigator.credentials.create", async () => {
      const getAttest = {
        challenge: 'sP4MiwodjreC8-80IMjcyWNlo_Y1SJXmFgQNBilnjdf30WRsjFDhDYmfY4-4uhq2HFjYREbXdr6Vjuvz2XvTjA==',
        user: {
            id: "YWRhbQ==",
            displayName: "Shubham Kumar",
            name: "skr"
        },
        pubKeyCredParams: [{
            alg: -7,
            type: "public-key"
        }]
      };
      const response = await solveRegist.solveRegistration(getAttest);
      console.log("response", response);
    });
  });
});
