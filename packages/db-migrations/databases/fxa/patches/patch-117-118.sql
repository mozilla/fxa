--
-- This migration adds the subscriptionFailedPaymentsCancellation emailType to
-- the emailTypes table.
--

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('117');

INSERT INTO emailTypes (emailType) VALUE ('subscriptionFailedPaymentsCancellation');

UPDATE dbMetadata SET value = '118' WHERE name = 'schema-patch-level';
