-- Rollback; commented out to prevent accidental running
-- in production.

-- ALTER TABLE `securityEvents`
-- ADD COLUMN tokenId BINARY(32)
-- ALGORITHM = INPLACE, LOCK = NONE;

-- CREATE INDEX securityEvents_uid_tokenId
-- ON securityEvents (uid, tokenId)
-- ALGORITHM = INPLACE, LOCK = NONE;

-- CREATE TABLE eventLogPublishState (
--   lastPublishedPos BIGINT UNSIGNED NOT NULL,
--   lastPublishedAt INT UNSIGNED NOT NULL
-- ) ENGINE=InnoDB;

-- CREATE TABLE eventLog (
--   pos BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
--   uid BINARY(16) NOT NULL,
--   typ ENUM('create', 'verify', 'reset', 'delete') NOT NULL,
--   iat INT UNSIGNED NOT NULL
-- ) ENGINE=InnoDB;

-- UPDATE dbMetadata SET value = '38' WHERE name = 'schema-patch-level';
