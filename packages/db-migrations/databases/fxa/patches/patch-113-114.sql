-- -- Create paypalCustomers table to store the relationship between FxA users and PayPal
-- -- This table can be joined with the existing accountCustomers table on the uid to map
-- -- a PayPal user to their stripeCustomerId.
-- -- endedAt is nullable by default, since active billing agreements would not have a value
-- -- A user can have more than one billing agreement e.g. if the funding becomes invalid
-- -- for the first one. This means there can be more than one row in the table for a given
-- -- FxA user, so we make a composite key as the primary key.

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('113');

CREATE TABLE IF NOT EXISTS paypalCustomers (
  uid BINARY(16),
  billingAgreementId CHAR(19),
  status VARCHAR(9) NOT NULL,
  createdAt BIGINT UNSIGNED NOT NULL,
  endedAt BIGINT UNSIGNED,
  PRIMARY KEY (uid, billingAgreementId)
) ENGINE=InnoDB;

UPDATE dbMetadata SET value = '114' WHERE name = 'schema-patch-level';
