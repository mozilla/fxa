ALTER TABLE codes ADD COLUMN sessionTokenId BINARY(32) DEFAULT NULL,
ALGORITHM = INPLACE, LOCK = NONE;

UPDATE dbMetadata SET value = '28' WHERE name = 'schema-patch-level';
