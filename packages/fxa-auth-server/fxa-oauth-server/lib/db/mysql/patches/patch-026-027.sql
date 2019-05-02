-- The `profileChangedAt` column was removed in patch-023-024 because
-- it caused migration issues. Now that we have resolved our migration
-- issues, it is safe to add this column back.
ALTER TABLE tokens ADD COLUMN profileChangedAt BIGINT DEFAULT NULL,
ALGORITHM = INPLACE, LOCK = NONE;

 UPDATE dbMetadata SET value = '27' WHERE name = 'schema-patch-level';
