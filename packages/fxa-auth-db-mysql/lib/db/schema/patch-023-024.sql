-- Add table for storing unverified sessionTokens.
CREATE TABLE `unverifiedTokens` (
  tokenId BINARY(32) NOT NULL PRIMARY KEY,
  tokenVerificationId BINARY(16) NOT NULL,
  uid BINARY(16) NOT NULL
) ENGINE=InnoDB;

-- Update createSessionToken stored procedure to
-- insert into unverifiedTokens.
CREATE PROCEDURE `createSessionToken_3` (
  IN tokenId BINARY(32),
  IN tokenData BINARY(32),
  IN uid BINARY(16),
  IN createdAt BIGINT UNSIGNED,
  IN uaBrowser VARCHAR(255),
  IN uaBrowserVersion VARCHAR(255),
  IN uaOS VARCHAR(255),
  IN uaOSVersion VARCHAR(255),
  IN uaDeviceType VARCHAR(255),
  IN tokenVerificationId BINARY(16)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  INSERT INTO sessionTokens(
    tokenId,
    tokenData,
    uid,
    createdAt,
    uaBrowser,
    uaBrowserVersion,
    uaOS,
    uaOSVersion,
    uaDeviceType,
    lastAccessTime
  )
  VALUES(
    tokenId,
    tokenData,
    uid,
    createdAt,
    uaBrowser,
    uaBrowserVersion,
    uaOS,
    uaOSVersion,
    uaDeviceType,
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

-- Update deleteSessionToken stored procedure to
-- delete from unverifiedTokens.
CREATE PROCEDURE `deleteSessionToken_2` (
  IN tokenIdArg BINARY(32)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  DELETE FROM sessionTokens WHERE tokenId = tokenIdArg;
  DELETE FROM unverifiedTokens WHERE tokenId = tokenIdArg;

  COMMIT;
END;

-- Add stored procedure for fetching sessionToken
-- with its verification status.
CREATE PROCEDURE `sessionTokenWithVerificationStatus_1` (
  IN tokenIdArg BINARY(32)
)
BEGIN
  SELECT
    t.tokenData,
    t.uid,
    t.createdAt,
    t.uaBrowser,
    t.uaBrowserVersion,
    t.uaOS,
    t.uaOSVersion,
    t.uaDeviceType,
    t.lastAccessTime,
    a.emailVerified,
    a.email,
    a.emailCode,
    a.verifierSetAt,
    a.locale,
    a.createdAt AS accountCreatedAt,
    ut.tokenVerificationId
  FROM sessionTokens AS t
  LEFT JOIN accounts AS a
    ON t.uid = a.uid
  LEFT JOIN unverifiedTokens AS ut
    ON t.tokenId = ut.tokenId
  WHERE t.tokenId = tokenIdArg;
END;

-- Update sessionWithDevice stored procedure to
-- fetch sessionToken verification status.
CREATE PROCEDURE `sessionWithDevice_3` (
  IN tokenIdArg BINARY(32)
)
BEGIN
  SELECT
    t.tokenData,
    t.uid,
    t.createdAt,
    t.uaBrowser,
    t.uaBrowserVersion,
    t.uaOS,
    t.uaOSVersion,
    t.uaDeviceType,
    t.lastAccessTime,
    a.emailVerified,
    a.email,
    a.emailCode,
    a.verifierSetAt,
    a.locale,
    a.createdAt AS accountCreatedAt,
    d.id AS deviceId,
    d.name AS deviceName,
    d.type AS deviceType,
    d.createdAt AS deviceCreatedAt,
    d.callbackURL AS deviceCallbackURL,
    d.callbackPublicKey AS deviceCallbackPublicKey,
    d.callbackAuthKey AS deviceCallbackAuthKey,
    ut.tokenVerificationId
  FROM sessionTokens AS t
  LEFT JOIN accounts AS a
    ON t.uid = a.uid
  LEFT JOIN devices AS d
    ON (t.tokenId = d.sessionTokenId AND t.uid = d.uid)
  LEFT JOIN unverifiedTokens AS ut
    ON t.tokenId = ut.tokenId
  WHERE t.tokenId = tokenIdArg;
END;

-- Add stored procedure for deleting unverifiedTokens.
CREATE PROCEDURE `verifyToken_1` (
  IN tokenVerificationIdArg BINARY(16),
  IN uidArg BINARY(16)
)
BEGIN
  DELETE FROM unverifiedTokens
  WHERE tokenVerificationId = tokenVerificationIdArg
  AND uid = uidArg;
END;

UPDATE dbMetadata SET value = '24' WHERE name = 'schema-patch-level';

