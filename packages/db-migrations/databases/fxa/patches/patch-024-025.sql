-- Update createKeyFetchToken stored procedure to
-- insert into unverifiedTokens.
CREATE PROCEDURE `createKeyFetchToken_2` (
  IN `tokenId` BINARY(32),
  IN `authKey` BINARY(32),
  IN `uid` BINARY(16),
  IN `keyBundle` BINARY(96),
  IN `createdAt` BIGINT UNSIGNED,
  IN `tokenVerificationId` BINARY(16)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  INSERT INTO keyFetchTokens(
    tokenId,
    authKey,
    uid,
    keyBundle,
    createdAt
  )
  VALUES(
    tokenId,
    authKey,
    uid,
    keyBundle,
    createdAt
  );

  IF tokenVerificationId IS NOT NULL THEN
    INSERT INTO unverifiedTokens(
      tokenId,
      tokenVerificationId,
      uid
    )
    VALUES(
      tokenId,
      tokenVerificationId,
      uid
    );
  END IF;

  COMMIT;
END;

-- Update deleteKeyFetchToken stored procedure to
-- delete from unverifiedTokens.
CREATE PROCEDURE `deleteKeyFetchToken_2` (
  IN `tokenIdArg` BINARY(32)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  DELETE FROM keyFetchTokens WHERE tokenId = tokenIdArg;
  DELETE FROM unverifiedTokens WHERE tokenId = tokenIdArg;

  COMMIT;
END;

-- Add stored procedure for fetching keyFetchToken
-- with its verification status.
CREATE PROCEDURE `keyFetchTokenWithVerificationStatus_1` (
  IN `tokenIdArg` BINARY(32)
)
BEGIN
  SELECT
    t.authKey,
    t.uid,
    t.keyBundle,
    t.createdAt,
    a.emailVerified,
    a.verifierSetAt,
    ut.tokenVerificationId
  FROM keyFetchTokens AS t
  LEFT JOIN accounts AS a
    ON t.uid = a.uid
  LEFT JOIN unverifiedTokens AS ut
    ON t.tokenId = ut.tokenId
  WHERE t.tokenId = tokenIdArg;
END;

UPDATE dbMetadata SET value = '25' WHERE name = 'schema-patch-level';

