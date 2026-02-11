-- This migration creates the `deviceFromTokenVerificationId_1`
-- procedure that tries to find a device associated with a session
-- that can be verified with a specific tokenVerificationId.

CREATE PROCEDURE `deviceFromTokenVerificationId_1` (
    IN inUid BINARY(16),
    IN inTokenVerificationId BINARY(16)
)
BEGIN
    SELECT
        d.id,
        d.name,
        d.type,
        d.createdAt,
        d.callbackURL,
        d.callbackPublicKey,
        d.callbackAuthKey
    FROM unverifiedTokens AS u
    INNER JOIN devices AS d
        ON (u.tokenId = d.sessionTokenId AND u.uid = d.uid)
    WHERE u.uid = inUid AND u.tokenVerificationId = inTokenVerificationId;
END;

UPDATE dbMetadata SET value = '42' WHERE name = 'schema-patch-level';
