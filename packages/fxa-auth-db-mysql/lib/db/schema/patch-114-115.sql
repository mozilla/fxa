SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('114');


-- When a user removes 2fa from their account, downgrade the verification
-- method for any TOTP-verified sessions back down to email code-verified.
CREATE PROCEDURE `downgradeSessionVerificationMethod_1` (
  IN `inUid` BINARY(16)
)
BEGIN
  UPDATE sessionTokens
  SET verificationMethod = 1
  WHERE uid = inUid
  AND verificationMethod = 2;
END;

UPDATE dbMetadata SET value = '115' WHERE name = 'schema-patch-level';
