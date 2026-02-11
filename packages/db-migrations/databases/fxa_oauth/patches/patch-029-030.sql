ALTER TABLE refreshTokens DROP COLUMN email;
ALTER TABLE tokens DROP COLUMN email;
ALTER TABLE codes DROP COLUMN email;

UPDATE dbMetadata SET value = '30' WHERE name = 'schema-patch-level';
