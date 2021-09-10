-- This migration completes the work of two previous migrations:
--
--   * v37, where we stopped recording account lifecycle
--     events in the `eventLog` table.
--   * v38, where we stopped using the `tokenId` column
--     in the `securityEvents` table.
--
-- It's the final cleanup work that we can do now that there
-- are no old webheads running previous versions of the code.


DROP TABLE eventLog;

DROP TABLE eventLogPublishState;

ALTER TABLE securityEvents
DROP INDEX securityEvents_uid_tokenId,
ALGORITHM = INPLACE, LOCK = NONE;

ALTER TABLE securityEvents
DROP COLUMN tokenId,
ALGORITHM = INPLACE, LOCK = NONE;

UPDATE dbMetadata SET value = '39' WHERE name = 'schema-patch-level';
