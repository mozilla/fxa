# The passkey wrap format is frozen at v1

- Status: proposed
- Deciders: Nick Shirley, [TODO: reviewers]
- Date: 2026-11-12, revised 2026-11-25 for the one-layer format

Technical Story: [FXA-14155]. The freeze itself predates this ADR; this records and ratifies it. The one-layer format it freezes lands in [#21823].

## Context and Problem Statement

A passkey wrap is the envelope in `passkeyWraps` that lets a passkey unlock `kB` without a password. The client builds it from `kB` and the passkey's WebAuthn PRF output, and the server stores it opaquely. The server holds neither `kB` nor `prfOut`, so it can never read, re-encrypt or repair a wrap. Only the client that holds the passkey can open one, and only with the exact bytes it was sealed under.

That makes the wrap a compatibility contract. Changing the PRF salt, the KDF, the AEAD, the domain-separation labels, the `aad` construction, the field sizes or the encoding after a wrap exists in production breaks every stored wrap at once. The user isn't locked out: the client reports the failed unwrap to Sentry and falls back to the password step. But a passkey the user set up specifically so they wouldn't need their password now asks for it, with no explanation, and the Sentry signal can't tell format drift from a wrong PRF output. Once a user has a wrap, it should keep working for as long as the passkey does, with the account reset path as the only exception.

How do we keep the format from moving, and what does a change look like when we need one?

## Decision Drivers

- A stored wrap must open for as long as the passkey exists. Asking for the password again is a regression, not a fallback.
- The server cannot migrate wrap data. Any format change is a client-side re-wrap.
- Format-defining values are spread across the crypto module, the API validator, the repository and the schema. They must move together or not at all.
- A refactor or a platform difference must not be able to change the format unnoticed.
- We still need to be able to change the format when there is a real reason, such as a broken primitive.

## Considered Options

- Option A: freeze v1 and ship any change as a new version beside it
- Option B: keep the format mutable while usage is low, and regenerate the fixture when it moves
- Option C: add versioning now, ahead of any need
- Option D: no versioning; on a format change, delete every wrap and re-wrap after the next password sign-in

## Decision Outcome

Chosen option: "Option A". The v1 format is frozen. Nothing in it changes in place. A change ships as v2 beside v1, in its own table with its own open path, and clients re-wrap lazily after a successful v1 unwrap. The v1 open path never goes away, because users who never come back keep v1 forever.

The freeze is dated from the fixture's last regeneration, 2026-11-24, when the format went from two layers to one (see "The one-layer format" below). Option B's window closes at the first production write, and nothing in the code or the tests can see that happen. Freezing before it, by decision, is the only way the freeze is a choice rather than something discovered after the fact.

Option D is what the server could do today: it already deletes wraps on an account reset, and the client already falls back to the password when an unwrap fails. We rejected it because it spends the one thing the wrap exists to provide. A user with a working passkey would be asked for their password because we changed something on our side. That is the failure this ADR is written to prevent, not an acceptable migration path.

The format itself, the values that make it up and the reasoning behind each one, is recorded in the module README at `packages/fxa-settings/src/lib/passkey-crypto/README.md`. That file sits beside the code and is updated with it. This ADR records the policy and the decisions a future reader might want to reopen.

### The one-layer format

v1 is one layer: a per-wrap AES-256-GCM key derived from `prfOut` with HKDF-SHA512 and a random 32-byte salt, and `kB` encrypted under it with the `uid` and `credentialId` bound as `aad`. Three stored fields, `kdfSalt`, `keyWrapIv` and `wrappedKb`, 92 bytes in all. Everything runs on Web Crypto; the module has no crypto dependency.

The design it replaced had two layers: `kB` sealed with HPKE (DHKEM P-521, HKDF-SHA512, AES-256-GCM) to a per-wrap recipient key, and that key's private half wrapped under `prfOut`. Five stored fields, 408 bytes, and a third-party HPKE library. The asymmetric layer existed for one capability: a client holding `kB` and the public key could write a new wrap for a passkey that was not present, which the tech spec listed as a key-rotation goal. [FXA-14742] then bound the private-key wrap to the credential, which closed that path by design. What remained was a second primitive, a dependency, and the P-521 platform differences that end in the password fallback, for no property the one-layer format lacks.

Because no production wrap existed and the wrap routes were flag-off in production, the change was made in place under Option B, once, with the fixture regenerated outside the module and independently verified. That was the last in-place change. Re-sealing a wrap without the passkey present is not possible in v1; if it is ever needed, it is a v2.

### What counts as a format change

Any change to one of these is a format change and lands as v2, never in place:

- The PRF salt the server hands to the WebAuthn ceremony.
- The KDF (hash, salt length, `info` label, output length) or the AEAD.
- The domain-separation labels, the `aad` label, the context framing, or the input encodings.
- Any field width.
- The one-layer structure itself, including adding an asymmetric step back.

The PRF salt is the odd one out: it's auth-server configuration, and the production value lives in infrastructure, not in this repository. A changed salt breaks every wrap with no diff here and no red test. Nothing holds it in place today beyond infrastructure change control. A startup guard that the value is set is a follow-up; it would catch a missing salt, not a changed one. The salt must also stay one static value: moving per-wrap randomness into the PRF input would require the server to know the credential before the assertion, which breaks discoverable sign-in.

### What holds the format in place

- **A golden envelope test** opens a committed v1 envelope produced outside the module and pins a hash of its fields. It is the one test that fails when the bytes move. It runs under Node's Web Crypto, not a browser's, so it catches the code moving, not a platform diverging.
- **Width assertions** in the client, the route validator and the repository. The repository is the last layer that can refuse a write. The `BINARY(n)` columns are the hazard, not a guard: MySQL right-pads a short value, and a padded wrap never opens.
- **A pre-commit check** that refuses a commit touching the fixture. It catches accidents only; CI does not run it and `--no-verify` skips it. The reviewer is the gate.
- **CODEOWNERS** entries for the crypto module, the passkey library and the `passkeyWraps` migrations. Today they point at the same team as the catch-all rule, so they route nothing until narrowed.

### Shape of a v2

- A version is a table, not a column. `passkeyWraps` stays as it is and v2 gets its own table with its own `BINARY(n)` widths. A `version` column on the v1 table would mean mixed-width rows in fixed-width columns, and MySQL right-pads a short `BINARY` value rather than rejecting it, so a padded wrap never opens. A second table costs a second lookup on read, and nothing else.
- The new table ships a release ahead of the code that writes to it, per the migration rules.
- The server reads the newest table first and falls back to v1, and accepts both before any client writes v2.
- The client writes v2 for new wraps and re-wraps a v1 after a successful v1 unwrap. The server cannot do this.
- The v1 open path and its golden fixture stay for every version ever shipped.
- If v1 must stop being opened before v2 is ready, `passwordlessSyncEnabled` withholds all wraps immediately. That is the kill switch, and it is the one case where users are knowingly sent back to the password.

What triggers a v2: a broken or deprecated primitive, or a capability v1 cannot provide, such as re-sealing for an absent passkey. The decision belongs to the passkey owners named in CODEOWNERS, with a security review.

### Positive Consequences

- A stored wrap opens for the life of the passkey, and the user is never asked for their password because of a change on our side.
- The cost of a change is visible up front: a new table, a second open path, a client migration.
- The golden envelope and the pinned widths turn "did the format move" into a red test rather than a judgement call.
- One primitive family and no crypto dependency: there is less that can drift, and a future primitive migration touches one layer.

### Negative Consequences

- The v1 open path is code we keep forever.
- A security fix to a primitive can't land in place. It ships as v2, and the kill switch is the only faster option.
- The PRF salt is not held by anything in this repository.
- A wrap can only be written by a client that has both `kB` and the passkey. Rotating `kB` for a passkey that is not present is a v2 feature, not a v1 one.
- The README and this ADR can drift from the code. The golden test catches the code moving, not the prose.

## Pros and Cons of the Options

### Option A: freeze v1, ship changes as a new version beside it

- Good, because the freeze is a decision with a date, not a state of the database.
- Good, because the cost of a change is visible up front.
- Bad, because the v1 open path is permanent.
- Bad, because a security fix to a primitive can't land in place.

### Option B: keep the format mutable while usage is low

- Good, because it's free while no production row exists, and we've already used it three times, the last to drop the HPKE layer.
- Bad, because "no production row exists" is a fact about the database. CI can't check it, and the reviewer has to see a production query to approve a regeneration.
- Bad, because each regeneration makes the next one easier to approve. The golden test exists to make it hard.

### Option C: add versioning now, ahead of any need

- Good, because v2 could land without a schema change at the time.
- Bad, because a version field inside the sealed envelope can't be read before decrypting, so it can't dispatch. It has to be a column or a table.
- Bad, because a column puts every version's widths into one set of fixed-width columns, and a short value is silently right-padded. A table per version avoids that, and a table is a thing we add when v2 exists, not before.

### Option D: no versioning, wipe and re-wrap

- Good, because there is no v1 code to keep, no dispatch and no schema change.
- Good, because the server already has the delete path and the client already has the password fallback.
- Bad, because every passwordless Sync user is asked for a password they set up a passkey to avoid. That is the failure the format freeze exists to prevent.

## Notes

- **`keysChangedAt` is not in the envelope.** The server enforces the `kB` generation: `resetAccount_20` deletes an account's wraps when the reset is flagged `keysHaveChanged`, and the read route returns errno 236 for a wrap older than `keysChangedAt`. Binding it in the envelope would mean matching it forever on both paths, and any drift would fail the unwrap indistinguishably from a wrong `prfOut`.
- **Regenerating the fixture** is allowed only while `passkeyWraps` is empty in stage and production and no released client writes wraps. That is Option B's precondition, and once it stops being true the option is gone. The README has the steps.
- **CODEOWNERS.** The entries added with this ADR use `@mozilla/fxa-devs` as a placeholder. [TODO: narrow to the people who own this.]
- **Follow-ups.** A startup guard that the PRF salt is set. A better Sentry signal for a failed unwrap, so format drift can be told from a wrong PRF output. The tech spec's rotation and `PUT /passkeys/keys` sections describe the two-layer design and need amending. [TODO: ticket numbers.]
- **Security review.** [TODO: outcome and date.]

## Links

- One-layer format change: [#21823]
- Module README: `packages/fxa-settings/src/lib/passkey-crypto/README.md`
- Golden fixture provenance: `packages/fxa-settings/src/lib/passkey-crypto/v1-envelope-fixture.json`, `_provenance`
- Schema: `packages/db-migrations/databases/fxa/patches/` patches 194-195 (table), 196-197 (drops `updatedAt`), 197-198 (`resetAccount_20` deletes wraps), 203-204 (one-layer columns)
- Decision history: [FXA-13138], [FXA-13142], [FXA-13144], [FXA-13146], [FXA-13147], [FXA-14742]

[#21823]: https://github.com/mozilla/fxa/pull/21823
[FXA-13138]: https://mozilla-hub.atlassian.net/browse/FXA-13138
[FXA-13142]: https://mozilla-hub.atlassian.net/browse/FXA-13142
[FXA-13144]: https://mozilla-hub.atlassian.net/browse/FXA-13144
[FXA-13146]: https://mozilla-hub.atlassian.net/browse/FXA-13146
[FXA-13147]: https://mozilla-hub.atlassian.net/browse/FXA-13147
[FXA-14155]: https://mozilla-hub.atlassian.net/browse/FXA-14155
[FXA-14742]: https://mozilla-hub.atlassian.net/browse/FXA-14742
