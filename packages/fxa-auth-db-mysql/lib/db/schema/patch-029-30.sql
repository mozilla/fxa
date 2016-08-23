-- Update deleteSessionToken stored procedure to delete from devices.
CREATE PROCEDURE `deleteSessionToken_3` (
  IN `tokenIdArg` BINARY(32)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- The 'devices' table has an index on (uid, sessionTokenId),
  -- so we have to look up the uid in order to do this efficiently.
  DELETE FROM devices
    WHERE sessionTokenId = tokenIdArg
    AND uid = (SELECT uid FROM sessionTokens WHERE tokenId = tokenIdArg);
  DELETE FROM sessionTokens WHERE tokenId = tokenIdArg;
  DELETE FROM unverifiedTokens WHERE tokenId = tokenIdArg;

  COMMIT;
END;

-- Update the patch level.
UPDATE dbMetadata SET value = '30' WHERE name = 'schema-patch-level';

