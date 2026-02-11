-- dropping NOT NULL constraint

ALTER TABLE refreshTokens MODIFY COLUMN email VARCHAR(256);
ALTER TABLE tokens MODIFY COLUMN email VARCHAR(256);
ALTER TABLE codes MODIFY COLUMN email VARCHAR(256);

UPDATE dbMetadata SET value = '29' WHERE name = 'schema-patch-level';
