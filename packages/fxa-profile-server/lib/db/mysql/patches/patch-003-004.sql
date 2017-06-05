--  Update profile table to utf8mb4

ALTER TABLE
    profile
    CONVERT TO CHARACTER SET utf8mb4
    COLLATE utf8mb4_bin;

UPDATE dbMetadata SET value = '4' WHERE name = 'schema-patch-level';
