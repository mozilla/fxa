--
-- This migration adds the subscriptionRenewalReminder emailType to
-- the emailTypes table.
--

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('115');

INSERT INTO emailTypes (emailType) VALUE ('subscriptionRenewalReminder');

UPDATE dbMetadata SET value = '116' WHERE name = 'schema-patch-level';
