-- Add checkPassword stored procedure

CREATE PROCEDURE `checkPassword_1` (
    IN `inUid` BINARY(16),
    IN `inVerifyHash` BINARY(32)
)
BEGIN
    SELECT uid FROM accounts WHERE uid = inUid AND verifyHash = inVerifyHash;
END;

UPDATE dbMetadata SET value = '11' WHERE name = 'schema-patch-level';
