CALL assertPatchLevel('128');

CREATE PROCEDURE `consumeUnblockCode_4` (
    inUid BINARY(16),
    inCodeHash BINARY(32),
    clearCode boolean
)
BEGIN
	SET @createdAt = 0;

	SELECT createdAt into @createdAt
	FROM unblockCodes
	WHERE uid = inUid AND unblockCodeHash = inCodeHash;

	DELETE FROM unblockCodes
    WHERE clearCode = true and @createdAt > 0 and uid = inUid;

	select @createdAt as createdAt;
END;

UPDATE dbMetadata SET value = '129' WHERE name = 'schema-patch-level';
