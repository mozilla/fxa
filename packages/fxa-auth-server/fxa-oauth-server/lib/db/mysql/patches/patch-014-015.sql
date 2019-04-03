-- Add index idx_expiresAt to token table

ALTER TABLE tokens ADD INDEX idx_expiresAt (expiresAt), ALGORITHM = INPLACE, LOCK = NONE;

UPDATE dbMetadata SET value = '15' WHERE name = 'schema-patch-level';
