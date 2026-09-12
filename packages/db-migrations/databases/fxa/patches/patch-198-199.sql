-- Add the security event name for a failed passkey wrap deletion, the one
-- wrap operation whose failures were unnamed. Its siblings landed in 195-196,
-- before DELETE /passkey/wraps existed.

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('198');

INSERT INTO securityEventNames (name) VALUES
  ('account.passkey.wrap_deletion_failure');

UPDATE dbMetadata SET value = '199' WHERE name = 'schema-patch-level';
