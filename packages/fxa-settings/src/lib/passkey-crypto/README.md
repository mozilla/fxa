# passkey-crypto

Client-side crypto for passkey `kB` key-wrapping.

Lives in `fxa-settings` because that is where its inputs and outputs already
are: `prfOut` comes from the WebAuthn ceremony in `../passkeys/`, and `kB`
arrives via `authClient.accountKeys()` and leaves over the Sync webchannel.
`fxa-settings` is the only consumer — the auth-server stores the envelope
opaquely, and `fxa-auth-client` only carries it over the wire (FXA-13148).
Extract to a shared lib if a second client ever needs it.

Two files, one layer:

- **Envelope** (`envelope.ts`) — the API callers use. `createWrapEnvelope` turns `kB` and `prfOut` into a v1 envelope; `openWrapEnvelope` turns a stored envelope and `prfOut` back into `kB`. Also owns the `aad` context, built from `uid` and `credentialId`. The envelope shape is `PasskeyWrapEnvelope` from `fxa-auth-client`, so what this module produces is exactly what `createPasskeyWrap` sends and `getPasskeyWrap` returns.
- **AES-GCM** (`key-wrap.ts`) — derive a per-wrap AES-256-GCM key from `prfOut` with HKDF, and wrap or unwrap `kB` under it. Web Crypto for every operation; no third-party crypto.

## The format

```
context   = len16(uid) || uid || len16(credentialId) || credentialId
kdfSalt   = random(32)
K         = HKDF-SHA512(ikm = prfOut, salt = kdfSalt, info = "fxa-passkey-kb-wrap-key-v1", L = 256 bits)
keyWrapIv = random(12)
wrappedKb = AES-256-GCM(K, keyWrapIv, aad = "fxa-passkey-kb-wrap-aad-v1" || context, kB)
```

Stored: `kdfSalt` (32), `keyWrapIv` (12), `wrappedKb` (48). The server holds
none of `kB`, `prfOut` or `K`, and every stored field is either random or
ciphertext.

## Frozen format contract

**Do not change the KDF, the AEAD, the sizes, the domain-separation labels, or the `aad` construction.** Every one of these is baked into stored envelopes. Changing one makes existing wraps un-openable, which sends users who set up a passkey to avoid their password back to it. Changes require a new envelope version with its own table and decrypt path — see `docs/adr/0053-passkey-wrap-format-stability.md`.

`PASSKEYS__PRF_SALT`, the WebAuthn `prf.eval.first` input the server hands to the ceremony, is part of the format too and must stay one static value. The per-wrap randomness lives in `kdfSalt`, after the ceremony. Moving it into the PRF input would require the server to know the credential before the assertion, which breaks discoverable sign-in and conditional UI.

## Iterating on the format

Nothing can change in place: with no version field there is one decrypt path and no way to tell formats apart. A v2 would need, in order:

1. **A new table for v2.** `passkeyWraps` stays as it is; the version is which table the row is in. A `version` column would put every version's widths into one set of `BINARY(n)` columns, and MySQL right-pads a short value rather than rejecting it, so a padded wrap never opens.
2. **Per-version sizes, in the new table.** An `AEAD` or tag change resizes `wrappedKb`; a nonce change resizes `keyWrapIv`; a KDF change leaves every width alone.
3. **A dispatched open path**: the server reads the newest table first and falls back to v1, and v1 is never edited. Golden vectors keep passing for every version ever shipped.
4. **Client-side lazy re-wrap.** The server holds neither `kB` nor `prfOut`, so it cannot re-encrypt anything; the client re-wraps after a successful v1 unwrap. Users who never return keep v1 indefinitely, so the v1 path is permanent. Follow the v1→v2 key-stretching upgrade in `fxa-auth-client`'s `signIn` and keep it non-fatal: report to Sentry and let sign-in succeed.

## Boundaries

- Everything crosses the module boundary as `Uint8Array`. No `CryptoKey` escapes a function.
- `envelope.ts` owns the `aad` framing; `key-wrap.ts` treats it as opaque bytes and only prefixes its own label. Callers pass credential context, not bytes: assembling the framing at two call sites is how you get envelopes that nothing can open, and the failure is indistinguishable from a wrong PRF output.
- `index.ts` exports `createWrapEnvelope`, `openWrapEnvelope` and the `EnvelopeContext` type, and nothing else, so the layer and the context construction are unreachable from outside.
- Client-only. The auth-server stores and returns the envelope opaquely and performs no crypto; `kB` and `prfOut` must never reach it. Nothing here may take a Node-only dependency.

## Constraints that are easy to reintroduce

- **`kdfSalt` must be freshly random per wrap.** `prfOut` is deterministic for a given credential and salt, so without it the AES key would be the same on every re-enrolment of the same credential, and a repeated nonce under that key would collapse GCM's confidentiality _and_ authenticity. The salt makes the key unique per wrap; the random `keyWrapIv` is a second guard, not the only one.
- **Widths are checked on the way out, not just the way in.** Every value bound for a `BINARY(n)` column is asserted at its v1 size before it is returned, and the auth-server checks it again in the route validator and the repository. A failure means a platform change moved one — and the alternative is a silently padded row that can never be opened.
- **The envelope binds `uid` and `credentialId`, and nothing else.** The `kB` generation is the server's to enforce: the `resetAccount_##` stored procedure deletes an account's wraps when the reset is flagged `keysHaveChanged`, and `GET /passkey/wraps/{credentialId}` returns errno 236 for a wrap predating the current `keysChangedAt`. Binding it here would mean plumbing `keysChangedAt` to both the create and unwrap paths and matching it forever — any drift fails the unwrap indistinguishably from a wrong `prfOut`, with no update path to recover through.
- **`kdfSalt` is not in the `aad`.** A tampered salt derives a wrong key and fails the tag check anyway; binding it would add nothing.
- **`prfOut` is HKDF input, not the AES key.** It is deterministic per credential and salt and carries no domain separation of its own, so using it raw would share one key with any future use of the same PRF salt.
- **One layer, no asymmetric step.** Earlier designs sealed `kB` with HPKE to a per-wrap keypair whose private key was then wrapped under `prfOut`. The only property that bought, writing a new `kB` for a passkey that is not present, had already been disabled by design, and the asymmetric layer brought a third-party curve implementation and the P-521 platform bugs with it. The ADR records the decision.

## Tests

Part of the `fxa-settings` suite (`nx test-integration fxa-settings`), or on
their own:

```sh
cd packages/fxa-settings && yarn test --watchAll=false src/lib/passkey-crypto
```

Real `crypto.subtle` — but Node's Web Crypto, not a browser's, and `setupTests.tsx` shims `getRandomValues`. These tests cannot catch platform differences; real browser coverage belongs in `packages/functional-tests`.

`golden-envelope.test.ts` decrypts a committed v1 envelope, so it is the only test anchored to bytes produced outside this module. Everything else either round-trips with the module's own code or pins a literal written beside it: `envelope.test.ts` pins the derived context.

## Regenerating the fixture

Almost never. Two things notice when the fixture changes. `_scripts/check-frozen.ts` lists it, so the local pre-commit hook refuses the commit; that catches an accidental edit and nothing more, since CI does not run the check and `--no-verify` skips it. `golden-envelope.test.ts` pins a SHA-256 of the vector fields, so a deliberate edit has to touch a second file, which CI does enforce. Neither prevents regeneration. They make it visible, and the reviewer is the gate.

### What a failure means

The question is not whether envelopes exist yet. It is: **does this change alter the bytes an envelope is made of, or how those bytes are opened?**

- **No.** A refactor, a rename, better error messages, a dependency bump, a new caller: `golden-envelope.test.ts` stays green and the fixture is not touched. This is the normal case.
- **Yes.** The golden test goes red. That is a format change, and the red test is the moment to stop. Every envelope already stored was sealed under the old bytes, and the server cannot fix them after the fact: it holds neither `kB` nor `prfOut`, so nothing can be re-encrypted server-side, and a stored envelope that stops opening sends that user back to their password.

A red golden test has two legitimate resolutions, and one illegitimate one.

1. **Reconsider the change.** Most format changes are not worth a migration. If existing envelopes must keep opening and the change is optional, drop it.
2. **Ship it as a new version.** The v1 fixture stays exactly as it is, the v1 open path stays intact, and v2 lands beside it with its own table, fixture and a written plan for existing envelopes before any code merges. "Iterating on the format" above lists the order.
3. **Regenerate the fixture.** Only when the format has genuinely not shipped: `passkeyWraps` is empty in stage and prod, and no released client calls `createWrapEnvelope`. Then nothing stored depends on the old bytes and the fixture may be regenerated once, following the steps below. Once that stops being true, this option is gone for good.

### Steps, when regenerating is the right answer

If the format genuinely has not shipped and must change:

1. Land the format change and get the round-trip tests green first, so the shape you freeze is the one that will ship.
2. Generate the vectors **outside this module**, in a throwaway Node script that uses `crypto.subtle` directly. Do not import from `envelope.ts` or `key-wrap.ts`: vectors produced by the code under test only restate what it does. Use fixed inputs so the run is reproducible: the existing `kB`, `prfOut`, `uid`, `credentialId`, `kdfSalt` and `keyWrapIv` are fine to keep. The script must, by hand: frame the context as `len(uid) || uid || len(credentialId) || credentialId`, each length a 2-byte big-endian prefix, `uid` decoded from hex and `credentialId` from base64url; derive a 256-bit AES-GCM key from `prfOut` with HKDF-SHA512, `salt` = `kdfSalt`, `info` = `KEY_WRAP_KDF_INFO`; and AES-256-GCM `kB` under `KEY_WRAP_AAD_LABEL || context` with the fixed `keyWrapIv`. Every constant is copied by value, not imported, so a typo fails the golden test rather than silently agreeing with the module.
3. Replace the vector fields in `v1-envelope-fixture.json`. Update `_provenance` with the date, commit and reason. The reviewer should open the new envelope the same way, with a script that imports nothing from this module, and say so in the review; the `independentlyVerified` entry records the last time that was done.
4. Run the golden suite. The hash test fails and prints the digest it computed. Recompute it yourself to confirm, from the module directory, and update `FIXTURE_SHA256`. Nothing else in the test should need to change.

   ```sh
   node -e 'const f=require("./v1-envelope-fixture.json");const k=["kB","prfOut","uid","credentialId","context","kdfSalt","keyWrapIv","wrappedKb"];console.log(require("crypto").createHash("sha256").update(k.map(n=>n+"="+f[n]).join("\n")).digest("hex"))'
   ```

5. Commit with `--no-verify`, since `check:frozen` will refuse the fixture, and say so in the commit's `Because:` along with the evidence from the first step that no envelope exists.

A PR that changes the KDF, AEAD, labels, context or sizes without a plan for existing envelopes, or that regenerates the fixture without steps 1 and 5 visible in its history, should not be approved, whatever the tests say.
