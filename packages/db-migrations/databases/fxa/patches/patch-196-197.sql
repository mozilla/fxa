SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('196');

-- Envelope format version, so a row can be classified without decrypting it.
--
-- The v1 crypto binds a `-v1` label into its HPKE info and its AES-GCM AAD, so a
-- future envelope replayed as v1 already fails authentication. What that cannot
-- do is tell the server, or a reader of this table, which format a row is in
-- before attempting to open it — hence a column rather than more labels.
--
-- Added now because it is free: no rows exist yet. A KDF or AEAD swap leaves
-- every stored width unchanged and this column covers it; a curve or KEM change
-- resizes the binary fields and wants its own table, since BINARY(n) zero-pads.
ALTER TABLE passkeyWraps
ADD COLUMN version TINYINT UNSIGNED NOT NULL DEFAULT 1 AFTER credentialId, ALGORITHM = INPLACE, LOCK = NONE;

UPDATE dbMetadata SET value = '197' WHERE name = 'schema-patch-level';
