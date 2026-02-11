-- dropping NOT NULL constraint

ALTER TABLE tokens MODIFY COLUMN email VARCHAR(256);

UPDATE dbMetadata SET value = '11' WHERE name = 'schema-patch-level';
