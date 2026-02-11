--  Add `needs_input` to the `carts` `state` enum.
-- ALTER TABLE carts
-- MODIFY state ENUM('start', 'processing', 'success', 'fail');

-- UPDATE dbMetadata SET value = '157' WHERE name = 'schema-patch-level';
