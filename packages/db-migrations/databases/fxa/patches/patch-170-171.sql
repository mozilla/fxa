ALTER TABLE carts MODIFY COLUMN amount INT NOT NULL;

UPDATE dbMetadata SET value = '171' WHERE name = 'schema-patch-level';
