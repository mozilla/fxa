/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const challenge = require("../../../lib/fido2/challenge");
const assert = require("chai").assert;

describe("Challenge", () => {
  describe("Validate credentials", () => {
    it("check credential type and response", () => {
      const credentials = {
        credentials: {
          rawId:
            "imCIoe8U_N9M1rTGeCqJ96TAu5uqSPa7YUzdh7qq-AdJlnBl8NwCpu2-sNj9UIVH5rAjX_RXlSGTGWKexKIZXA",
          id:
            "imCIoe8U_N9M1rTGeCqJ96TAu5uqSPa7YUzdh7qq-AdJlnBl8NwCpu2-sNj9UIVH5rAjX_RXlSGTGWKexKIZXA",
          response: {
            authenticatorData:
              "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2MBAAAALQ",
            signature:
              "MEUCIQCFOqnsAFZLQmcPt2qSjnCb403SisGEASSjT3fOPuD5JgIgFr1i0_7OR_NiyXU_Usemg9ez8pilwSdQ4QwThlzmHs4",
            userHandle: "",
            clientDataJSON:
              "eyJjaGFsbGVuZ2UiOiJDUXF5aUlrQ00yWEtvaHVSdlNqTEFoNGZfSV9DTkc3SHNPQnZuNWFlOEVZIiwib3JpZ2luIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwIiwidHlwZSI6IndlYmF1dGhuLmdldCJ9",
          },
          type: "public-key",
        },
      };
      assert.strictEqual(challenge.validateCredentials(credentials), true);
    });
  });
  describe("Challenge from ClientData", () => {
    it("Get challenge from clientData", () => {
      const clientDataJSON =
        "eyJjaGFsbGVuZ2UiOiJVMmQ0TjNZME0wOU1jbGRQYjFSNVpFeG5UbG95IiwiY2xpZW50RXh0ZW5zaW9ucyI6e30sImhhc2hBbGdvcml0aG0iOiJTSEEtMjU2Iiwib3JpZ2luIjoiaHR0cHM6Ly9jbG92ZXIubWlsbGVydGltZS5kZXY6MzAwMCIsInR5cGUiOiJ3ZWJhdXRobi5jcmVhdGUifQ==";
      const expectedChallenge = "U2d4N3Y0M09McldPb1R5ZExnTloy";
      assert.equal(
        challenge.challengeFromClientData(clientDataJSON),
        expectedChallenge
      );
    });
  });
});
