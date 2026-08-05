# passkey-crypto

Client-side crypto primitives for passkey `kB` key-wrapping.

Lives in `fxa-settings` because that is where its inputs and outputs already
are: `prfOut` comes from the WebAuthn ceremony in `../passkeys/`, and `kB`
arrives via `authClient.accountKeys()` and leaves over the Sync webchannel.
`fxa-settings` is the only consumer — the auth-server stores the envelope
opaquely, and `fxa-auth-client` only carries it over the wire (FXA-13148).
Extract to a shared lib if a second client ever needs it.

Two layers, kept separate:

- **HPKE** (`hpke.ts`) — seal `kB` to a per-wrap recipient public key, and open it again.
- **AES-GCM** (`key-wrap.ts`) — generate the recipient keypair and wrap its private key under the passkey's PRF output. Web Crypto for every cryptographic operation; the `hpke` import is a serialiser only.

The ciphersuite both layers share lives in `suite.ts`, and is not re-exported: it deals in `CryptoKey`s, which never leave this module.

## Frozen format contract

**Do not change the ciphersuite, mode, sizes, or the `hpke` dependency version.** Every value here is baked into stored envelopes. Changing one makes existing wraps un-openable, which locks users out of their Sync data with no recovery path. Changes require a new envelope version with its own decrypt path — see FXA-14155.

The v1 ciphersuite is `DHKEM(P-521, HKDF-SHA512)` / `HKDF-SHA512` / `AES-256-GCM`, HPKE mode 0 (`mode_base`). `hpke` is pinned to an exact version for this reason.

## Boundaries

- Everything crosses the module boundary as `Uint8Array`. No `CryptoKey` escapes a function.
- `info` and `aad` are opaque parameters. This library neither constructs nor interprets them — building them from credential context belongs to the caller (FXA-13147).
- Client-only. The auth-server stores and returns the envelope opaquely and performs no crypto; `kB` must never reach it. Nothing here may take a Node-only dependency.

## Two constraints that are easy to reintroduce

- **`keyWrapIv` must be freshly random per wrap.** `prfOut` is deterministic for a given credential and salt, so the AES-GCM key repeats across re-enrolments. A reused nonce under that key collapses GCM's confidentiality _and_ authenticity guarantees.
- **`openKb` takes `pkR` as well as the private key.** Where the `hpke` library can derive the public key it does so via `crypto.subtle.getPublicKey`, whose fallback requires an extractable key. In a runtime without `getPublicKey` a non-extractable key fails — and surfaces as a generic `DecapError`. Node provides `getPublicKey`, so that bug passes tests and CI and only breaks in the browser.
- **`skR` is stored as the raw scalar, not a PKCS#8 export.** PKCS#8 measures 241 bytes only because every Web Crypto implementation happens to emit the OPTIONAL public-key field. `Nsk` = 66 is a ciphersuite constant, and the fixed-width `prfWrappedSkR` column would silently zero-pad anything shorter. Leave the serialising to `SerializePrivateKey`, which pads short scalars.

## Tests

Part of the `fxa-settings` suite (`nx test-integration fxa-settings`), or on
their own:

```sh
cd packages/fxa-settings && yarn test --watchAll=false src/lib/passkey-crypto
```

Real Web Crypto and the real `hpke` library throughout, no mocked primitives. Includes the RFC 9180 Appendix A.6 vectors, which confirm the ciphersuite is configured correctly — distinct from the golden vectors in FXA-14269, which freeze _our_ envelope format.
