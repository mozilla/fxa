SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CREATE PROCEDURE `consumeUnblockCode_3` (
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

    IF @timestamp > 0 THEN
        DELETE FROM unblockCodes
        WHERE
            uid = inUid;
    END IF;

    SELECT @timestamp AS createdAt;
END;

UPDATE dbMetadata SET value = '78' WHERE name = 'schema-patch-level';

