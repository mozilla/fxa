DROP TABLE accounts;

UPDATE metadata SET value = '1' WHERE name = 'schema-patch-level';
