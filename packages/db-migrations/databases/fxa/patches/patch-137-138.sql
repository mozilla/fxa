-- This migration updates recoveryKey table to store a hint.
-- This will allow users to save or update a hint to remember where they have stored
-- their recovery key. Users that have set up account recovery before this migration
-- will have hint set to null.

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('137');

-- Add column `hint`
ALTER TABLE `recoveryKeys`
ADD COLUMN `hint` VARCHAR(255) DEFAULT NULL,
ALGORITHM = INSTANT;

UPDATE dbMetadata SET value = '138' WHERE name = 'schema-patch-level';
