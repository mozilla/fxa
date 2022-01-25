SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('124');

-- This change fixes an issue where MySQL fails to find a proper primary key
-- when doing a sub select in a query.
-- Ref: https://github.com/mozilla/fxa/issues/11612 and
-- https://github.com/mozilla/fxa-auth-db-mysql/issues/440
ALTER TABLE emailBounces CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

UPDATE dbMetadata SET value = '125' WHERE name = 'schema-patch-level';
