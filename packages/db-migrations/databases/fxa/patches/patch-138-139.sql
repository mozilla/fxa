-- Create carts table to store checkout Cart state when creating a subscription.
-- An FxA user can have more than one Cart record e.g. if they have more than
-- one subscription where each subscription was created in a different session.
-- A Cart record may not be associated with an FxA user e.g. if they started
-- the new user checkout flow but did not get to the point where we create an
-- account.

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('138');

CREATE TABLE IF NOT EXISTS carts (
    id BINARY(16) NOT NULL PRIMARY KEY,
    uid BINARY(16),
    state ENUM('start', 'processing', 'success', 'fail') NOT NULL,
    errorReasonId VARCHAR(255),
    offeringConfigId VARCHAR(255) NOT NULL,
    `interval` VARCHAR(255) NOT NULL,
    experiment VARCHAR(255),
    taxAddress JSON,
    createdAt BIGINT UNSIGNED NOT NULL,
    updatedAt BIGINT UNSIGNED NOT NULL,
    couponCode VARCHAR(255),
    stripeCustomerId VARCHAR(32),
    email VARCHAR(255),
    amount INT UNSIGNED NOT NULL,
    FOREIGN KEY (uid) REFERENCES accounts(uid) ON DELETE CASCADE
) ENGINE=InnoDB;

UPDATE dbMetadata SET value = '139' WHERE name = 'schema-patch-level';
