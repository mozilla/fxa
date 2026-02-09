-- Remove security event names for passwordless authentication

-- SET NAMES utf8mb4 COLLATE utf8mb4_bin;

-- CALL assertPatchLevel('184');

-- DELETE FROM securityEventNames WHERE name IN (
--   'account.passwordless_login_otp_sent',
--   'account.passwordless_login_otp_failed',
--   'account.passwordless_login_otp_verified',
--   'account.passwordless_registration_complete'
-- );

-- UPDATE dbMetadata SET value = '183' WHERE name = 'schema-patch-level';

