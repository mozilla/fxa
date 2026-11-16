# The passkey wrap format is frozen at v1

- Status: proposed
- Deciders: Nick Shirley, [TODO: reviewers]
- Date: 2026-11-12

Technical Story: [FXA-14155]. Records decisions made in [FXA-13138], [FXA-13142], [FXA-13144], [FXA-13147] and [FXA-14742].

## Context and Problem Statement

A passkey wrap is the envelope in `passkeyWraps` that lets a passkey unlock `kB` without a password. The client builds it from `kB` and the passkey's WebAuthn PRF output, and the server stores it opaquely. The server holds neither `kB` nor `prfOut`, so it can never read, re-encrypt or repair a wrap. Only the client that holds the passkey can open one, and only with the exact bytes it was sealed under.

That makes the wrap a compatibility contract. Changing the PRF salt, the ciphersuite, the HPKE mode, the domain-separation labels, the `info` or `aad` construction, the field sizes or the encoding after a wrap exists in production silently locks that user out of Sync. There is no error at write time and no signal at read time. The unwrap fails the same way it would for a wrong PRF output.

How do we keep the format from moving, and what does a change look like when we need one?

## Decision Drivers

- A stored wrap must open for as long as the passkey exists. There is no recovery path if it does not.
- The server cannot migrate wrap data. Any format change is a client-side re-wrap.
- Format-defining values are spread across three places: the crypto module, the API validator and the schema. They must move together or not at all.
- A dependency bump, a refactor or a platform difference must not be able to change the format unnoticed.
- We still need to be able to change the format when there is a real reason, such as a broken primitive.

## Considered Options

- Option A: freeze v1 and ship any change as a new version beside it
- Option B: keep the format mutable while usage is low, and regenerate the fixture when it moves
- Option C: add a version field to the envelope now, ahead of any need

## Decision Outcome

Chosen option: "Option A". The v1 format is frozen as of 2026-10-15 ([FXA-14742]) and recorded below. Nothing in it changes in place. A change ships as v2 beside v1, with a `version` column on `passkeyWraps`, a dispatched open path, and lazy client-side re-wrap. The v1 open path never goes away, because users who never come back keep v1 forever.

Option B is what we did before the first production write: `v1-envelope-fixture.json` records two regenerations. It stops working the day the first production row lands, so it can't be the standing policy. Option C costs a column and a decrypt branch for a change nobody has asked for, and a version field inside the envelope can't be read without decrypting it. We add the column when we add v2.

### The frozen v1 format

| Value | Frozen as | Where |
| --- | --- | --- |
| PRF salt | `PASSKEYS__PRF_SALT`, one static base64url value, same for every credential | auth-server config, `prfSalt` |
| Ciphersuite | `DHKEM(P-521, HKDF-SHA512)` / `HKDF-SHA512` / `AES-256-GCM` | `suite.ts` |
| HPKE mode | `mode_base` (0): no PSK, no sender auth | `suite.ts` |
| `hpke` library | `1.1.3`, exact pin | `fxa-settings/package.json` |
| Context | `len(uid) ‖ uid ‖ len(credentialId) ‖ credentialId`, 2-byte big-endian lengths, `uid` from hex, `credentialId` from base64url | `envelope.ts` |
| HPKE `info` | `"fxa-passkey-kb-wrap-v1" ‖ context` | `hpke.ts` |
| HPKE `aad` | empty | `envelope.ts` |
| `skR` wrap key | HKDF-SHA512(`prfOut`, empty salt, info `"fxa-passkey-skr-wrap-key-v1"`), 256 bits | `key-wrap.ts` |
| `skR` wrap `aad` | `"fxa-passkey-skr-wrap-v1" ‖ context ‖ len(pkR) ‖ pkR ‖ len(enc) ‖ enc ‖ len(ct) ‖ ct` | `envelope.ts` |
| `skR` serialisation | raw big-endian scalar, left-padded to `Nsk` = 66 | `key-wrap.ts` |
| Sizes | `pkR` 133, `prfWrappedSkR` 82, `keyWrapIv` 12, `hpkeEncapsulatedSecret` 133, `hpkeSealedKb` 48 | `constants.ts`, `passkey.wrap.repository.ts`, patch 194-195 |

The client module is `packages/fxa-settings/src/lib/passkey-crypto/`. Its README has the day-to-day detail: the boundaries, the constraints that are easy to reintroduce, and how to regenerate the fixture. This ADR records the decisions. The README records how to work within them.

### What holds the format in place

- **The golden envelope.** `golden-envelope.test.ts` opens a committed v1 envelope produced outside the module, from `hpke` and Web Crypto directly, and pins a SHA-256 of its fields. Every other test seals and opens with the same code and passes whatever the format is. This one fails when the bytes move.
- **The RFC 9180 A.6 vectors.** Copied verbatim from the RFC, so a vendored copy cannot drift from its source. They prove the ciphersuite is configured correctly; the golden envelope proves our wiring around it has not moved.
- **Sizes asserted at every boundary.** The client asserts each field at its v1 width on the way out, the route validator accepts exactly one base64url length per field, and each column is `BINARY(n)`. A size that moves fails in three places.
- **The pre-commit frozen-file check.** `check-frozen.ts` refuses a commit that touches the fixture. It catches accidents only, since CI does not run it and `--no-verify` skips it. The reviewer is the gate. The CODEOWNERS entry added with this ADR is a placeholder for routing to one until owners are named.

### Sub-decisions

Each of these is a wire value or a structural choice someone will want to change at some point. They're recorded so we don't redo the reasoning, and so a change to any of them is understood as a format change.

#### Field sizes are ciphersuite-derived

Every size in the table falls out of P-521 and AES-256-GCM. A KDF or AEAD swap within the same key size leaves every stored length unchanged, but a curve or KEM change resizes everything, and since `BINARY(n)` zero-pads, a shorter value would be stored and never open again. A curve change is therefore a coordinated migration across the crypto module, the API validator and the schema, never a dependency bump. New sizes want a new table, not widened columns.

#### `skR` is stored as the raw scalar, not a PKCS#8 export

Decided in [FXA-13144]. `prfWrappedSkR` is 82 bytes rather than 257. `Nsk` = 66 is a ciphersuite constant, whereas PKCS#8's 241 bytes rest on every Web Crypto implementation emitting an OPTIONAL public-key field that no spec requires. A conforming implementation that omitted it would produce a short wrap, be zero-padded into the fixed-width column, and never open again. That failure would be invisible in Node and CI and break in one browser.

The `hpke` serialiser does not pad: it decodes the JWK `d` as-is. `generateRecipientKeyPair` left-pads to `Nsk` itself. Roughly one P-521 key in 512 has a leading zero byte, so without the pad about 0.2% of wraps would be short.

#### The two-layer structure is retained

The spec (§2.2.1) lists rotating the recipient keypair without the authenticator present as a MUST, and only HPKE satisfies it: sealing a new `kB` needs `pkR` alone. Bulk rotation is descoped ([FXA-13146]) but the requirement stands, and `PUT /passkeys/keys` (§2.4) is its storage half. A single AES-GCM layer under `prfOut` would be simpler and would lose this.

#### Context travels in HPKE `info`, and the HPKE `aad` is empty

Decided in [FXA-13147], which also removed `keysChangedAt` from the context. Everything the HPKE layer authenticates is in `info`; `sealKb` and `openKb` keep the `aad` parameter because RFC 9180 has the slot, but nothing fills it at v1. A value that migrated from `info` to `aad` would be a format change like any other.

`keysChangedAt` is not bound because the server already enforces the `kB` generation: `resetAccount_20` deletes an account's wraps when a reset rotates `kB`, and `GET /passkey/wraps/{credentialId}` returns errno 236 for a wrap older than the account's `keysChangedAt`. Binding it in the envelope would mean matching it forever on both paths, and any drift would fail the unwrap indistinguishably from a wrong `prfOut`.

#### The `skR` wrap carries an `aad`, and it binds `pkR`, `enc` and `ct`

Decided in [FXA-14742]. This departs from the spec, whose §2.2.4 snippet passes `aad` to `hpke.seal` only and wraps `skR` with none.

[FXA-14155] opened both halves of this as questions and assessed each as low value: `prfOut` is credential-specific, so a transplanted row fails on the wrong key regardless, and swapping `pkR` looked like denial of service rather than key compromise. The second assessment missed that `pkR` is stored in the clear and HPKE `mode_base` authenticates nothing a PRF holder can check. Anyone with write access to the row can `Seal` a `kB` of their choosing to the stored `pkR`, and the genuine `skR` opens it. That is `kB` substitution, not denial of service (appscanner f002). Binding `pkR`, `enc` and `ct` into the `skR` wrap's `aad` means a substituted field fails the AES-GCM tag over `skR` before HPKE runs.

Known gap: the password path has the same exposure through `wrapKb`, and this ADR doesn't close it there. The fix here is an AAD on a layer we already control. Shipping a new path with a known substitution hole is worse than being inconsistent with the old one.

#### `prfOut` is HKDF input, not the AES key

`prfOut` is deterministic per credential and salt and carries no domain separation of its own. Used raw, it would share a key with any future use of the same PRF salt. One HKDF call scopes it to this purpose. `KEY_WRAP_KDF_INFO` is distinct from `KEY_WRAP_AAD_LABEL` so the derived key and the AAD can never collide.

#### The wrap routes are gated on a passkey assertion plus password reauth, not the general MFA scope

The spec (§6) requires MFA for all passkey management. The wrap routes don't follow it. They require an `mfa:passkey:wraps` token, which only the passkey verification ceremony can mint, since `passkey:wraps` is not in `config.mfa.actions` and the email OTP cannot produce it. The token is bound to the session and to the credential that signed, and each route refuses a token bound to a different credential. `POST /passkey/wraps` additionally requires that the session has verified the password since it was created.

The threat is a holder of a copied passkey writing a wrap for a `kB` they derived after an account reset. An email OTP proves control of the inbox, not possession of `kB`. The sealed `kB` is stored unread, so password reauth on the session is the only proof the caller could have derived it. The passkey assertion proves possession of the credential the wrap is written for. One proof per secret.

[TODO: security review outcome and date.]

#### P-521 browser support

Verified against WebKit on 2026-07-28: macOS Safari 26.4 and iOS 27 beta run every `crypto.subtle` operation the wrap flow needs, with field sizes identical to Node. That confirms the ceiling. The floor on older iOS is still open. The cheaper check is the iOS version distribution for Sync users, not device testing. Two platform differences have already bitten us in this module, the JWK `d` width and a missing `getPublicKey`. Both are simulated in tests because Playwright has no WebKit project.

### What a v2 looks like

In order, and none of it touches v1:

1. **A `version` column on `passkeyWraps`**, defaulting to 1 so existing rows classify themselves. The HPKE `info` cannot serve, since the version must be known before decrypting, though binding it there as well would make a v2 envelope replayed as v1 fail authentication.
2. **Per-version sizes.** A new table if the KEM or curve changes, since `BINARY(n)` zero-pads.
3. **A dispatched open path** that adds v2 beside v1. Golden vectors keep passing for every version ever shipped.
4. **Client-side lazy re-wrap** after a successful v1 unwrap, following the v1-to-v2 key-stretching upgrade in `fxa-auth-client`'s `signIn`. Non-fatal: report to Sentry and let sign-in succeed. The server cannot do this, and users who never return keep v1 indefinitely.

## Pros and Cons of the Options

### Option A: freeze v1, ship changes as a new version beside it

- Good, because a stored wrap opens for the life of the passkey.
- Good, because the cost of a change is visible up front: a column, a second decrypt path, a client migration.
- Good, because the golden envelope and the pinned widths turn "did the format move" into a red test rather than a judgement call.
- Bad, because the v1 open path is code we keep forever, platform workarounds included.
- Bad, because a security fix to a primitive can't land in place. It ships as v2 and old wraps stay on v1 until the user comes back.

### Option B: keep the format mutable while usage is low

- Good, because it's free while no production row exists, and we've already used it twice.
- Bad, because "no production row exists" is a fact about the database, not the code, and no test can check it. The first production write ends this option with no signal.
- Bad, because each regeneration makes the next one easier to approve. The golden test exists to make it hard.

### Option C: a version field inside the envelope now

- Good, because v2 could land without a schema change.
- Bad, because a field inside the envelope cannot be read before decrypting, so it cannot dispatch. A column is needed regardless.
- Bad, because it adds bytes to every column width for a change nobody has asked for.

## Notes

- **CODEOWNERS.** This ADR adds `packages/fxa-settings/src/lib/passkey-crypto/`, `libs/accounts/passkey/` and the existing `passkeyWraps` migrations to CODEOWNERS so that a format-adjacent change always reaches a reviewer who knows the contract. [TODO: narrow from `@mozilla/fxa-devs` to the people who own this.]
- **The `hpke` pin.** Exact-pinned so the format can't move unnoticed, but the format is RFC 9180's, not the library's. A patch or minor bump that keeps the A.6 vectors and the golden envelope green is fine. Don't block one that carries a security fix.
- **Server-side validation.** `V1_WIDTHS` in `@fxa/accounts/passkey` is the single source for the route validator, so a v2 field cannot reach the handler unvalidated.

## Links

- Module README: `packages/fxa-settings/src/lib/passkey-crypto/README.md`
- Golden fixture provenance: `packages/fxa-settings/src/lib/passkey-crypto/v1-envelope-fixture.json`, `_provenance`
- Schema: `packages/db-migrations/databases/fxa/patches/patch-194-195.sql`
- Test coverage: [FXA-13144] (RFC 9180 vectors, golden envelope), [FXA-14269] (full golden vector set)
- Passkey tech spec: [TODO: link]

[FXA-13138]: https://mozilla-hub.atlassian.net/browse/FXA-13138
[FXA-13142]: https://mozilla-hub.atlassian.net/browse/FXA-13142
[FXA-13144]: https://mozilla-hub.atlassian.net/browse/FXA-13144
[FXA-13146]: https://mozilla-hub.atlassian.net/browse/FXA-13146
[FXA-13147]: https://mozilla-hub.atlassian.net/browse/FXA-13147
[FXA-14155]: https://mozilla-hub.atlassian.net/browse/FXA-14155
[FXA-14269]: https://mozilla-hub.atlassian.net/browse/FXA-14269
[FXA-14742]: https://mozilla-hub.atlassian.net/browse/FXA-14742
