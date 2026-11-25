SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('203');

-- The passkey wrap envelope drops its HPKE layer before the first production
-- write. kB is now wrapped directly under a key derived from the passkey's PRF
-- output, so the per-wrap recipient keypair and the HPKE fields go away and a
-- per-wrap HKDF salt arrives.
--
-- Not expand/contract: the wrap routes are behind `passkeys.passwordlessSyncEnabled`,
-- which is off in production, and no production row exists. Rows on stage are
-- QA data in the old format that nothing can open once the client changes, so
-- they are cleared here. Every column is BINARY of the exact width the format
-- produces, because MySQL right-pads a short BINARY value instead of rejecting it.
DELETE FROM passkeyWraps;

ALTER TABLE passkeyWraps
  DROP COLUMN pkR,
  DROP COLUMN prfWrappedSkR,
  DROP COLUMN hpkeEncapsulatedSecret,
  DROP COLUMN hpkeSealedKb,
  ADD COLUMN kdfSalt BINARY(32) NOT NULL AFTER credentialId,   -- HKDF salt, fresh per wrap
  ADD COLUMN wrappedKb BINARY(48) NOT NULL AFTER keyWrapIv,    -- AES-256-GCM(kB) + 16B tag
  ALGORITHM = INPLACE, LOCK = NONE;

UPDATE dbMetadata SET value = '204' WHERE name = 'schema-patch-level';
