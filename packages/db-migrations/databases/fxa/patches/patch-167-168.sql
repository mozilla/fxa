SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('167');

ALTER TABLE `securityEvents` ADD COLUMN `additionalInfo` JSON DEFAULT NULL, ALGORITHM = INSTANT;

CREATE PROCEDURE `createSecurityEvent_5` (
    IN inUid BINARY(16),
    IN inToken BINARY(32),
    IN inName INT,
    IN inIpAddrHmac BINARY(32),
    IN inCreatedAt BIGINT SIGNED,
    IN inIpAddr VARCHAR(39),
    IN inAdditionalInfo JSON
        )
BEGIN
    DECLARE inTokenVerificationId BINARY(16);
    SET inTokenVerificationId = (
      SELECT tokenVerificationId
      FROM unverifiedTokens u
      WHERE u.uid = inUid AND u.tokenId = inToken
    );
    INSERT INTO securityEvents(
        uid,
        tokenVerificationId,
        verified,
        nameId,
        ipAddrHmac,
        createdAt,
        ipAddr,
        additionalInfo
    )
    VALUES(
          inUid,
          inTokenVerificationId,
          inTokenVerificationId IS NULL,
          inName,
          inIpAddrHmac,
          inCreatedAt,
          inIpAddr,
          inAdditionalInfo
      );
END;

UPDATE dbMetadata SET value = '168' WHERE name = 'schema-patch-level';
