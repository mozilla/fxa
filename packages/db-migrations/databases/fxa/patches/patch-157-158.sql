SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('157');

CREATE INDEX emails_uid_verifiedAt
ON emails (uid, verifiedAt)
ALGORITHM = INPLACE LOCK = NONE;

CREATE INDEX sessionTokens_uid_lastAccessTime
ON sessionTokens (uid, lastAccessTime)
ALGORITHM = INPLACE LOCK = NONE;

CREATE INDEX securityEvents_nameId_uid_createdAt
ON securityEvents (nameId, uid, createdAt)
ALGORITHM = INPLACE LOCK = NONE;

UPDATE dbMetadata SET value = '158' WHERE name = 'schema-patch-level';
