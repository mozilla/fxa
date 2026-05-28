-- Add an auto-incrementing integer surrogate key to fxa_oauth.scopes so
-- downstream code can reference scope rows by a stable numeric id. The
-- existing `scope` string column is demoted from PRIMARY KEY to a UNIQUE
-- index — uniqueness is still required by grant-time getScope() lookups,
-- but the row identity moves to `id`. AUTO_INCREMENT backfills `id` for
-- existing rows during the ALTER.

ALTER TABLE scopes
  DROP PRIMARY KEY,
  ADD COLUMN id INT UNSIGNED NOT NULL AUTO_INCREMENT FIRST,
  ADD PRIMARY KEY (id),
  ADD UNIQUE KEY scopes_scope_unique (scope);

UPDATE dbMetadata SET value = '37' WHERE name = 'schema-patch-level';
