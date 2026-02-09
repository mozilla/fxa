-- Add security event names for passwordless authentication
-- These events track the passwordless login flow including OTP sending,
-- verification, failures, and new account registration

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('183');

INSERT INTO securityEventNames (name) VALUES
  ('account.passwordless_login_otp_sent'),
  ('account.passwordless_login_otp_failed'),
  ('account.passwordless_login_otp_verified'),
  ('account.passwordless_registration_complete');

UPDATE dbMetadata SET value = '184' WHERE name = 'schema-patch-level';

