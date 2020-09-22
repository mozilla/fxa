-- -- create accountCustomers table to store the relationship between fxa users and external payment providers
-- -- stripeCustomerId is nullable by default with the idea that this table can be added upon in the future
-- -- By creating additional columns for new payment providers. This table will be able to act as a way
-- -- to quickly determine: is a user also a customer and which payment provider(s) is/are they using?

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('112');

CREATE TABLE IF NOT EXISTS accountCustomers (
  uid BINARY(16) PRIMARY KEY,
  stripeCustomerId VARCHAR(32),
  createdAt BIGINT UNSIGNED NOT NULL,
  updatedAt BIGINT UNSIGNED NOT NULL
) ENGINE=InnoDB;

UPDATE dbMetadata SET value = '113' WHERE name = 'schema-patch-level';
