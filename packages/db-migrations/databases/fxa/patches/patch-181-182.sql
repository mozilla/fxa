SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('181');

INSERT INTO emailTypes (emailType) VALUES
('subscriptionEndingReminder');

UPDATE dbMetadata SET value = '182' WHERE name = 'schema-patch-level';
