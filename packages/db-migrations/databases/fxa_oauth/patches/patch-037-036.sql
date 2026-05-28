-- Reverse of patch-036-037. Reverse patching is disabled in the runner.

-- ALTER TABLE scopes
--   DROP PRIMARY KEY,
--   DROP INDEX scopes_scope_unique,
--   DROP COLUMN id,
--   ADD PRIMARY KEY (scope);

-- UPDATE dbMetadata SET value = '36' WHERE name = 'schema-patch-level';
