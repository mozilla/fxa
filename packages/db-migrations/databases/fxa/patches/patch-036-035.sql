-- Rollback to previous logic for securityEvents table.

-- CREATE INDEX securityEvents_uid_ipAddrHmac
-- ON securityEvents (uid, ipAddrHmac)
-- ALGORITHM = INPLACE, LOCK = NONE;

-- DROP PROCEDURE `verifyToken_3`
-- DROP PROCEDURE `createSecurityEvent_2`

-- DROP INDEX securityEvents_uid_tokenVerificationId
-- ON securityEvents
-- ALGORITHM = INPLACE, LOCK = NONE;

-- DROP INDEX securityEvents_uid_ipAddrHmac_createdAt
-- ON securityEvents
-- ALGORITHM = INPLACE, LOCK = NONE;

-- ALTER TABLE `securityEvents`
-- DROP COLUMN `tokenVerificationId`
-- ALGORITHM = INPLACE, LOCK = NONE;

-- UPDATE dbMetadata SET value = '35' WHERE name = 'schema-patch-level';
