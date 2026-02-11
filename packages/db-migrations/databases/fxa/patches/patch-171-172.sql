ALTER TABLE carts
ADD COLUMN stripeIntentId VARCHAR(255) AFTER stripeSubscriptionId, ALGORITHM = INPLACE, LOCK = NONE;

UPDATE dbMetadata SET value = '172' WHERE name = 'schema-patch-level';
