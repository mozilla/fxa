-- This migration changes the `createSecurityEvent` procedure
-- to stop writing to the `securityEvents.tokenId` column.
-- That column is no longer used by we were still writing to it
-- for backwards-compatibility reasons.
--
-- We cant actually drop the column until this change is deployed
-- and nothing is writing to it, so a future migration will be
-- needed in order to:
--
--  * drop the tokenId column
--  * drop the corresponding securityEvents_uid_tokenId index
--

CREATE PROCEDURE `createSecurityEvent_3` (
    IN inUid BINARY(16),
    IN inToken BINARY(32),
    IN inName INT,
    IN inIpAddr BINARY(32),
    IN inCreatedAt BIGINT SIGNED
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
        createdAt
    )
    VALUES(
        inUid,
        inTokenVerificationId,
        inTokenVerificationId IS NULL,
        inName,
        inIpAddr,
        inCreatedAt
    );
END;

UPDATE dbMetadata SET value = '38' WHERE name = 'schema-patch-level';
