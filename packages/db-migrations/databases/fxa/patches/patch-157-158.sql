--  Add `needs_input` to the `carts` `state` enum.
ALTER TABLE carts
MODIFY state ENUM('start', 'processing', 'success', 'fail', 'needs_input');

UPDATE dbMetadata SET value = '158' WHERE name = 'schema-patch-level';
