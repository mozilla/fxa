SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('87');

CREATE PROCEDURE `verifyTokensWithMethod_3` (
  IN `tokenIdArg` BINARY(32),
  IN `verificationMethodArg` INT,
  IN `verifiedAtArg` BIGINT(1)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

    -- Update session verification methods
    UPDATE `sessionTokens` SET verificationMethod = verificationMethodArg, verifiedAt = verifiedAtArg
    WHERE tokenId = tokenIdArg;

END;

CREATE PROCEDURE `verifyTokenCode_2` (
  IN `tokenVerificationCodeHashArg` BINARY(32),
  IN `uidArg` BINARY(16)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  SET @tokenVerificationId = NULL;
  SELECT tokenVerificationId INTO @tokenVerificationId FROM unverifiedTokens
    WHERE uid = uidArg
    AND tokenVerificationCodeHash = tokenVerificationCodeHashArg
    AND tokenVerificationCodeExpiresAt >= (UNIX_TIMESTAMP(NOW(3)) * 1000);

  IF @tokenVerificationId IS NULL THEN
    SET @expiredCount = 0;
    SELECT COUNT(*) INTO @expiredCount FROM unverifiedTokens
      WHERE uid = uidArg
      AND tokenVerificationCodeHash = tokenVerificationCodeHashArg
      AND tokenVerificationCodeExpiresAt < (UNIX_TIMESTAMP(NOW(3)) * 1000);

    IF @expiredCount > 0 THEN
      SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 2101, MESSAGE_TEXT = 'Expired token verification code.';
    END IF;
  END IF;

  UPDATE securityEvents
  SET verified = true
  WHERE tokenVerificationId = @tokenVerificationId
  AND uid = uidArg;

  DELETE FROM unverifiedTokens
  WHERE tokenVerificationId = @tokenVerificationId
  AND uid = uidArg;
END;

UPDATE dbMetadata SET value = '88' WHERE name = 'schema-patch-level';
