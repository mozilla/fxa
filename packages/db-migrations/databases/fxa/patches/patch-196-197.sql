-- Drop passkeyWraps.updatedAt. A wrap is never updated: the envelope is sealed
-- to a kB that a password reset invalidates, so a stale wrap is deleted and
-- re-created rather than rewritten. The column only ever held createdAt.

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('196');

ALTER TABLE passkeyWraps DROP COLUMN updatedAt;

UPDATE dbMetadata SET value = '197' WHERE name = 'schema-patch-level';
