SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('146');

ALTER TABLE `securityEvents`
ADD COLUMN `ipAddr` varchar(39) DEFAULT NULL,
ALGORITHM = INSTANT;


CREATE PROCEDURE `createSecurityEvent_4` (
    IN inUid BINARY(16),
    IN inToken BINARY(32),
    IN inName INT,
    IN inIpAddrHmac BINARY(32),
    IN inCreatedAt BIGINT SIGNED,
    IN inIpAddr VARCHAR(39)
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
        ipAddr
    )
    VALUES(
        inUid,
        inTokenVerificationId,
        inTokenVerificationId IS NULL,
        inName,
        inIpAddrHmac,
        inCreatedAt,
        inIpAddr
    );
END;

UPDATE dbMetadata SET value = '147' WHERE name = 'schema-patch-level';
