CREATE PROCEDURE `setPrimaryEmail_1` (
  IN `inUid` BINARY(16),
  IN `inNormalizedEmail` VARCHAR(255)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;
     UPDATE emails SET isPrimary = false WHERE uid = inUid AND isPrimary = true;
     UPDATE emails SET isPrimary = true WHERE uid = inUid AND isPrimary = false AND normalizedEmail = inNormalizedEmail;

     SELECT ROW_COUNT() INTO @updateCount;
     IF @updateCount = 0 THEN
        SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 1062, MESSAGE_TEXT = 'Can not change email. Could not find email.';
     END IF;
  COMMIT;
END;

CREATE PROCEDURE `accountRecord_1` (
  IN `inEmail` VARCHAR(255)
)
BEGIN
    SELECT
        a.uid,
        a.email,
        a.normalizedEmail,
        a.emailVerified,
        a.emailCode,
        a.kA,
        a.wrapWrapKb,
        a.verifierVersion,
        a.verifyHash,
        a.authSalt,
        a.verifierSetAt,
        e.normalizedEmail AS primaryEmail
    FROM
        accounts a,
        emails e
    WHERE
        a.uid = (SELECT uid FROM emails WHERE normalizedEmail = LOWER(inEmail))
    AND
        a.uid = e.uid
    AND
        e.isPrimary = true;
END;

UPDATE dbMetadata SET value = '57' WHERE name = 'schema-patch-level';
