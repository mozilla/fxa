-- Add an index to walk accountCustomers table by Stripe customer id,
-- which is used in Stripe webhook handlers to avoid making unnecessary
-- Stripe or Firestore calls.
SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('119');

CREATE INDEX `accountCustomers_stripeCustomerId`
ON `accountCustomers` (`stripeCustomerId`)
ALGORITHM = INPLACE LOCK = NONE;

UPDATE dbMetadata SET value = '120' WHERE name = 'schema-patch-level';
