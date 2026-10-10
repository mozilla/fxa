-- Add the security event names for the passkey verification ceremony, the
-- MFA step-up that mints a scoped token from a passkey assertion.

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('199');

INSERT INTO securityEventNames (name) VALUES
  ('account.passkey.verification_success'),
  ('account.passkey.verification_failure');

UPDATE dbMetadata SET value = '200' WHERE name = 'schema-patch-level';
