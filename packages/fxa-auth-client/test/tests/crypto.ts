import { assert } from "chai";
import { getCredentials, unbundleKeyFetchResponse } from "../../src/crypto";

describe("getCredentials", () => {
  it("returns the correct authPW and unwrapBKey", async () => {
    const email = "andré@example.org";
    const password = "pässwörd";
    const keys = await getCredentials(email, password);
    assert.equal(
      keys.authPW,
      "247b675ffb4c46310bc87e26d712153abe5e1c90ef00a4784594f97ef54f2375"
    );
    assert.equal(
      keys.unwrapBKey,
      "de6a2648b78284fcb9ffa81ba95803309cfba7af583c01a8a1a63e567234dd28"
    );
  });
});

describe("unbundleKeyFetchResponse", () => {
  it("returns the correct kA and wrapKB", async () => {
    const bundleKey =
      "dedd009a8275a4f672bb4b41e14a117812c0b2f400c85fa058e0293f3f45726a";
    const bundle =
      "df4717238a738501bd2ad8f7114ef193ea69751a40108149bfb88a5643a8d683a1e75b705d4db135130f0896dbac0819ab7d54334e0cd4f9c945e0a7ada91899756cedf4384be404844050270310bc2b396f100eeda0c7b428cfe77c40a873ae";
    const keys = await unbundleKeyFetchResponse(bundleKey, bundle);
    assert.equal(
      keys.kA,
      "939282904b808c6003ea31aeb14bc766d2ab70ba7dcaa54f820efcf4762b9619"
    );
    assert.equal(
      keys.wrapKB,
      "849ac9f71643ace46dcdd384633ec1bffe565852806ee2f859c3eba7fafeafec"
    );
  });
});
