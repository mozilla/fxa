ALTER TABLE `carts`
ADD COLUMN `stripeSubscriptionId` VARCHAR(255) AFTER `stripeCustomerId`,
ALGORITHM = INPLACE, LOCK = NONE;

UPDATE `dbMetadata` SET value = '156' WHERE name = 'schema-patch-level';
