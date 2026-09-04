# passkey-crypto

Client-side crypto primitives for passkey `kB` key-wrapping.

Lives in `fxa-settings` because that is where its inputs and outputs already
are: `prfOut` comes from the WebAuthn ceremony in `../passkeys/`, and `kB`
arrives via `authClient.accountKeys()` and leaves over the Sync webchannel.
`fxa-settings` is the only consumer — the auth-server stores the envelope
opaquely, and `fxa-auth-client` only carries it over the wire (FXA-13148).
Extract to a shared lib if a second client ever needs it.

Two crypto layers, kept separate, plus the composition that drives them:

- **Envelope** (`envelope.ts`) — the API callers use. `createWrapEnvelope` turns `kB` and `prfOut` into a v1 envelope; `openWrapEnvelope` turns a stored envelope and `prfOut` back into `kB`. Also owns the `info`/`aad` context both layers bind, built from `uid` and `credentialId`. The envelope shape is `PasskeyWrapEnvelope` from `fxa-auth-client`, so what this module produces is exactly what `createPasskeyWrap` sends and `getPasskeyWrap` returns.
- **HPKE** (`hpke.ts`) — seal `kB` to a per-wrap recipient public key, and open it again.
- **AES-GCM** (`key-wrap.ts`) — generate the recipient keypair and wrap its private key under the passkey's PRF output. Web Crypto for every cryptographic operation; the `hpke` imports are a private-key serialiser and a byte-join helper, no crypto.

The ciphersuite both crypto layers share lives in `suite.ts`, and is not re-exported: it deals in `CryptoKey`s, which never leave this module.

## Frozen format contract

**Do not change the ciphersuite, mode, sizes, domain-separation labels, or the `info`/`aad` construction.** Every one of these is baked into stored envelopes. Changing one makes existing wraps un-openable, which locks users out of their Sync data with no recovery path. Changes require a new envelope version with its own decrypt path — see FXA-14155.

The v1 ciphersuite is `DHKEM(P-521, HKDF-SHA512)` / `HKDF-SHA512` / `AES-256-GCM`, HPKE mode 0 (`mode_base`).

`hpke` is pinned to an exact version, but the _format_ is RFC 9180's, not the library's. A patch or minor upgrade is fine — and should not be blocked when it carries a security fix — provided the RFC 9180 A.6 vectors and `golden-envelope.test.ts` still pass. Those two together are what actually holds the format; the pin only stops it moving unnoticed.

## Iterating on the format

Nothing can change in place: with no version field there is one decrypt path and no way to tell formats apart. A v2 would need, in order:

1. **A `version` column on `passkeyWraps`**, defaulting to 1 so existing rows classify themselves. The HPKE `info` cannot serve — you would have to decrypt to learn which format you hold — though binding the version there as well would make a v2 envelope replayed as v1 fail authentication.
2. **Per-version sizes.** A `KDF` or `AEAD` swap leaves every stored length unchanged; a curve or `KEM` change resizes everything, and since `BINARY(n)` zero-pads those wraps want their own table rather than widened columns.
3. **A dispatched open path**, adding v2 alongside v1 and never editing v1. Golden vectors keep passing for every version ever shipped.
4. **Client-side lazy re-wrap.** The server holds neither `kB` nor `prfOut`, so it cannot re-encrypt anything; the client re-wraps after a successful v1 unwrap. Users who never return keep v1 indefinitely, so the v1 path is permanent. Follow the v1→v2 key-stretching upgrade in `fxa-auth-client`'s `signIn` and keep it non-fatal: report to Sentry and let sign-in succeed.

## Boundaries

- Everything crosses the module boundary as `Uint8Array`. No `CryptoKey` escapes a function.
- `info` and `aad` are opaque to `hpke.ts` and `key-wrap.ts`, but `envelope.ts` owns their construction. Callers pass credential context, not bytes: assembling the framing at two call sites is how you get envelopes that nothing can open, and the failure is indistinguishable from a wrong PRF output.
- `skR` never reaches a caller or the network: the wrapped form is the only copy that leaves `envelope.ts`. The buffers it owns are zeroed on success and on failure, but zeroing is best-effort in JS — importing the scalar goes through a JWK `d` string, which is immutable and collectable only by GC.
- `index.ts` exports `createWrapEnvelope` and `openWrapEnvelope` and nothing else, so the layers and the context construction are unreachable from outside.
- Client-only. The auth-server stores and returns the envelope opaquely and performs no crypto; `kB` must never reach it. Nothing here may take a Node-only dependency.

## Constraints that are easy to reintroduce

- **`keyWrapIv` must be freshly random per wrap.** `prfOut` is deterministic for a given credential and salt, and HKDF is deterministic too, so the AES-GCM key repeats across re-enrolments. A reused nonce under that key collapses GCM's confidentiality _and_ authenticity guarantees.
- **`openKb` rebuilds the keypair itself, from `pkR` and the scalar.** Not `suite.DeserializePrivateKey`: given the scalar alone the library has to recover the public point by multiplying it against the curve generator, which it does with a pure-JS BigInt wNAF multiply branching on secret-derived digits — on every unlock. Since `pkR` is stored, Web Crypto can import the pair directly from a JWK. That also sidesteps `crypto.subtle.getPublicKey`, whose fallback requires an extractable key, so a runtime without it (WebKit at time of writing) failed with a generic `DecapError` that Node would never reproduce. `hpke.test.ts` holds all of it: a spy proving `DeserializePrivateKey` is never called, an equivalence test against it, and the `getPublicKey`-deleted suite.
- **Widths are checked on the way out, not just the way in.** Every value bound for a `BINARY(n)` column is asserted at its v1 size before it is returned. These are ciphersuite constants, so a failure means a library or platform change moved one — and the alternative is a silently padded row that can never be opened.
- **The envelope binds `uid` and `credentialId`, and nothing else.** The `kB` generation is the server's to enforce: the `resetAccount_##` stored procedure deletes an account's wraps when a reset rotates `kB`, and `GET /passkey/wraps/{credentialId}` returns errno 236 for a wrap predating the current `keysChangedAt`. Binding it here would mean plumbing `keysChangedAt` to both the create and unwrap paths and matching it forever — any drift fails the unwrap indistinguishably from a wrong `prfOut`, with no update path to recover through.
- **The HPKE `aad` is empty.** Everything the envelope authenticates travels in `info`. `sealKb` and `openKb` keep the parameter because RFC 9180 has the slot, but nothing fills it at v1 — and a value that migrated from `info` to `aad` would be a format change like any other.
- **`prfOut` is HKDF input, not the AES key.** It is deterministic per credential and salt and carries no domain separation of its own, so using it raw would share one key with any future use of the same PRF salt.
- **`skR` is stored as the raw scalar, not a PKCS#8 export.** PKCS#8 measures 241 bytes only because every Web Crypto implementation happens to emit the OPTIONAL public-key field. `Nsk` = 66 is a ciphersuite constant, and the fixed-width `prfWrappedSkR` column would silently zero-pad anything shorter. `SerializePrivateKey` decodes the JWK `d` as-is and does **not** pad, so `generateRecipientKeyPair` left-pads to `Nsk` — a platform whose EC export strips leading zeros would otherwise store a short scalar for roughly 1 key in 512.

## Tests

Part of the `fxa-settings` suite (`nx test-integration fxa-settings`), or on
their own:

```sh
cd packages/fxa-settings && yarn test --watchAll=false src/lib/passkey-crypto
```

Real `crypto.subtle` and the real `hpke` library — but Node's Web Crypto, not a browser's, and `setupTests.tsx` shims `getRandomValues`. These tests cannot catch platform differences; the two that have bitten us (JWK `d` width and a missing `getPublicKey`) are simulated instead, and real browser coverage belongs in `packages/functional-tests`.

Two suites carry more weight than the rest.

The RFC 9180 Appendix A.6 vectors confirm the ciphersuite is configured correctly. They are copied verbatim from the RFC, which is safe in a way the envelope fixture is not: the RFC is published and immutable, so a vendored copy cannot drift from its source, and a value that diverges from it fails the tests rather than silencing them.
`golden-envelope.test.ts` decrypts a committed v1 envelope, so it is the only test anchored to bytes produced outside this module — everything else seals and opens with the same code and passes whatever the format is. `envelope.test.ts` pins the derived context too, but against a literal in the same file.

Regenerating the fixture is only safe while no shipped client has written a v1 envelope. Once one has, the committed vectors are the only evidence of the format those stored rows were sealed under, and regenerating them turns a test that would have caught a format change into one that ratifies it — locking those users out of Sync with no recovery path, since the envelope carries no version field.
