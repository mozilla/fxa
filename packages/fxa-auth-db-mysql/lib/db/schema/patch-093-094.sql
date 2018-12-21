SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('93');

-- Removes the check for setting a primary email to an unverified email. The check
-- is currently having some unexpected behavior. This is safe to remove for now
-- because the check is performed in the auth-server before it sets the
-- new primary email.
-- Ref: https://github.com/mozilla/fxa-auth-server/blob/master/lib/routes/emails.js#L763
CREATE PROCEDURE `setPrimaryEmail_5` (
  IN `inUid` BINARY(16),
  IN `inNormalizedEmail` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_bin
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

    SELECT normalizedEmail INTO @foundEmail FROM emails WHERE uid = inUid AND normalizedEmail = inNormalizedEmail AND isVerified;
    IF @foundEmail IS NULL THEN
     SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 1062, MESSAGE_TEXT = 'Can not change email. Could not find email.';
    END IF;

    UPDATE emails SET isPrimary = false WHERE uid = inUid AND isPrimary = true;
    UPDATE emails SET isPrimary = true WHERE uid = inUid AND isPrimary = false AND normalizedEmail = inNormalizedEmail;
  COMMIT;
END;

UPDATE dbMetadata SET value = '94' WHERE name = 'schema-patch-level';
