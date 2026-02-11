-- Add uaBrowser, uaBrowserVersion, uaOS, uaOSVersion, uaDeviceType
-- and lastAccessTime fields to sessionTokens table

ALTER TABLE sessionTokens ADD COLUMN uaBrowser VARCHAR(255);
ALTER TABLE sessionTokens ADD COLUMN uaBrowserVersion VARCHAR(255);
ALTER TABLE sessionTokens ADD COLUMN uaOS VARCHAR(255);
ALTER TABLE sessionTokens ADD COLUMN uaOSVersion VARCHAR(255);
ALTER TABLE sessionTokens ADD COLUMN uaDeviceType VARCHAR(255);
ALTER TABLE sessionTokens ADD COLUMN lastAccessTime BIGINT UNSIGNED NOT NULL DEFAULT 0;

CREATE PROCEDURE `createSessionToken_2` (
    IN tokenId BINARY(32),
    IN tokenData BINARY(32),
    IN uid BINARY(16),
    IN createdAt BIGINT UNSIGNED,
    IN uaBrowser VARCHAR(255),
    IN uaBrowserVersion VARCHAR(255),
    IN uaOS VARCHAR(255),
    IN uaOSVersion VARCHAR(255),
    IN uaDeviceType VARCHAR(255)
)
BEGIN
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
END;

CREATE PROCEDURE `sessionToken_2` (
    IN `inTokenId` BINARY(32)
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
        a.locale
    FROM
        sessionTokens t,
        accounts a
    WHERE
        t.tokenId = inTokenId
    AND
        t.uid = a.uid
    ;
END;

CREATE PROCEDURE `updateSessionToken_1` (
    IN uaBrowserArg VARCHAR(255),
    IN uaBrowserVersionArg VARCHAR(255),
    IN uaOSArg VARCHAR(255),
    IN uaOSVersionArg VARCHAR(255),
    IN uaDeviceTypeArg VARCHAR(255),
    IN lastAccessTimeArg BIGINT UNSIGNED,
    IN tokenIdArg BINARY(32)
)
BEGIN
    UPDATE sessionTokens
        SET uaBrowser = uaBrowserArg,
            uaBrowserVersion = uaBrowserVersionArg,
            uaOS = uaOSArg,
            uaOSVersion = uaOSVersionArg,
            uaDeviceType = uaDeviceTypeArg,
            lastAccessTime = lastAccessTimeArg
        WHERE tokenId = tokenIdArg;
END;

UPDATE dbMetadata SET value = '15' WHERE name = 'schema-patch-level';

