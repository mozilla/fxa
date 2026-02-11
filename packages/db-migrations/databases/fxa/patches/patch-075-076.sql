SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CREATE PROCEDURE `verifyTokensWithMethod_2` (
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

  START TRANSACTION;
    -- Update session verification methods
    UPDATE `sessionTokens` SET verificationMethod = verificationMethodArg, verifiedAt = verifiedAtArg
    WHERE tokenId = tokenIdArg;

    SET @updateCount = (SELECT ROW_COUNT());

    -- Get the tokenVerificationId and uid for session
    SET @tokenVerificationId = NULL;
    SET @uid = NULL;
    SELECT tokenVerificationId, uid INTO @tokenVerificationId, @uid FROM `unverifiedTokens`
    WHERE tokenId = tokenIdArg;

    -- Verify tokens with tokenVerificationId
    CALL verifyToken_3(@tokenVerificationId, @uid);
  COMMIT;

  SELECT @updateCount;
END;

UPDATE dbMetadata SET value = '76' WHERE name = 'schema-patch-level';

