-- Add security event names for the passkey wrap lifecycle. A wrap is the
-- envelope in passkeyWraps that lets a passkey unlock kB without a password.
--
-- Named for the wrap rather than the route, following account.two_factor_*
-- (/totp). Which step failed goes in additionalInfo.reason, so a new failure
-- mode needs no migration.

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('195');

INSERT INTO securityEventNames (name) VALUES
  ('account.passkey.wrap_created'),
  ('account.passkey.wrap_creation_failure'),
  ('account.passkey.wrap_retrieved'),
  ('account.passkey.wrap_retrieval_failure'),
  ('account.passkey.wrap_deleted'),
  ('account.passkey.wrap_invalidated');

UPDATE dbMetadata SET value = '196' WHERE name = 'schema-patch-level';
