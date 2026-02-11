--
-- This migration adds the subscriptionAccountFinishSetup emailType to
-- the emailTypes table. This email contains link to set
-- password on a passwordless account.
--

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('118');

INSERT INTO emailTypes (emailType) VALUE ('subscriptionAccountFinishSetup');

UPDATE dbMetadata SET value = '119' WHERE name = 'schema-patch-level';
