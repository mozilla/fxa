SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CREATE PROCEDURE `consumeUnblockCode_2` (
    inUid BINARY(16),
    inCodeHash BINARY(32)
)
BEGIN
    DECLARE timestamp BIGINT;
    SET @timestamp = (
        SELECT createdAt FROM unblockCodes
        WHERE
            uid = inUid
        AND
            unblockCodeHash = inCodeHash
    );

    DELETE FROM unblockCodes
    WHERE
        uid = inUid;

    SELECT @timestamp AS createdAt;
END;

UPDATE dbMetadata SET value = '77' WHERE name = 'schema-patch-level';
