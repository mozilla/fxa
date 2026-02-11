SET NAMES utf8mb4 COLLATE utf8mb4_bin;

-- Bump these to your next migration numbers
CALL assertPatchLevel('175');

INSERT INTO securityEventNames (name) VALUES
  ('account.password_upgrade_success'),
  ('account.password_upgraded'),
  ('account.recovery_phone_setup_failed'),
  ('account.mfa_send_otp_code'),
  ('account.mfa_verify_otp_code_success'),
  ('account.mfa_verify_otp_code_failed');

UPDATE dbMetadata SET value = '176' WHERE name = 'schema-patch-level';
