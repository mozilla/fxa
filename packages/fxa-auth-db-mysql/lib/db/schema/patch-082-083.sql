SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CREATE PROCEDURE `assertPatchLevel` (
  IN `requiredLevel` TEXT
)
BEGIN
  SELECT @currentPatchLevel := value FROM dbMetadata WHERE name = 'schema-patch-level';
  IF @currentPatchLevel != requiredLevel THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 1643, MESSAGE_TEXT = 'Missing migration detected';
  END IF;
END;

UPDATE dbMetadata SET value = '83' WHERE name = 'schema-patch-level';
