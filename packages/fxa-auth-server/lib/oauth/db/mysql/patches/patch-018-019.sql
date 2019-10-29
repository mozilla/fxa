ALTER TABLE codes ADD COLUMN keysJwe MEDIUMTEXT,
ALGORITHM = INPLACE, LOCK = NONE;

UPDATE dbMetadata SET value = '19' WHERE name = 'schema-patch-level';
