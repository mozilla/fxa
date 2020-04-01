import { assert } from "chai";
import { uint8ToHex } from "../../src/utils";
import { deriveHawkCredentials, hawkHeader } from "../../src/hawk";

describe("hawk", () => {
  describe("header", () => {
    const encoder = new TextEncoder();
    const credentials = {
      id: "123456",
      key: encoder.encode("2983d45yun89q")
    };
    // Test vectors from https://github.com/hapijs/hawk/blob/master/test/client.js
    it("returns a valid authorization header (empty payload)", async () => {
      const h = await hawkHeader(
        "POST",
        "https://example.net/somewhere/over/the/rainbow",
        {
          credentials,
          timestamp: 1353809207,
          nonce: "Ygvqdz",
          payload: "",
          contentType: "text/plain"
        }
      );
      assert.equal(
        h,
        'Hawk id="123456", ts="1353809207", nonce="Ygvqdz", hash="q/t+NNAkQZNlq/aAD6PlexImwQTxwgT2MahfTa9XRLA=", mac="U5k16YEzn3UnBHKeBzsDXn067Gu3R4YaY6xOt9PYRZM="'
      );
    });
    it("returns a valid authorization header with payload", async () => {
      const h = await hawkHeader(
        "POST",
        "https://example.net/somewhere/over/the/rainbow",
        {
          credentials,
          timestamp: 1353809207,
          nonce: "Ygvqdz",
          payload: "something to write about",
          contentType: "text/plain"
        }
      );
      assert.equal(
        h,
        'Hawk id="123456", ts="1353809207", nonce="Ygvqdz", hash="2QfCt3GuY9HQnHWyWD3wX68ZOKbynqlfYmuO2ZBRqtY=", mac="HTgtd0jPI6E4izx8e4OHdO36q00xFCU0FolNq3RiCYs="'
      );
    });
  });

  describe("deriveHawkCredentials", () => {
    it("returns the correct id and key", async () => {
      const sessionToken =
        "a0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebf";
      const context = "sessionToken";
      const result = await deriveHawkCredentials(sessionToken, context);
      assert.equal(
        uint8ToHex(result.key),
        "9d8f22998ee7f5798b887042466b72d53e56ab0c094388bf65831f702d2febc0"
      );
      assert.equal(
        result.id,
        "c0a29dcf46174973da1378696e4c82ae10f723cf4f4d9f75e39f4ae3851595ab"
      );
    });
  });
});
