SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('187');

INSERT INTO emailTypes (emailType) VALUES
('freeTrialEndingReminder');

UPDATE dbMetadata SET value = '188' WHERE name = 'schema-patch-level';
