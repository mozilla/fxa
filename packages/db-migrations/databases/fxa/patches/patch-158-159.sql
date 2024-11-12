SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('158');

-- Create the 'recoveryPhone' table.
-- Per spec, the phone number is only inserted if it has been verified.
-- Phone number is in E.164 format and 15 chars max length.
-- `lookupData` contains data from https://www.twilio.com/docs/lookup/v2-api
CREATE TABLE recoveryPhones (
    uid BINARY(16) NOT NULL,
    phoneNumber VARCHAR(15) NOT NULL,
    createdAt BIGINT UNSIGNED NOT NULL,
    lastConfirmed BIGINT UNSIGNED NOT NULL,
    lookupData JSON,
    PRIMARY KEY (uid),
    INDEX idx_phoneNumber (phoneNumber),
    FOREIGN KEY (uid) REFERENCES accounts(uid) ON DELETE CASCADE
);

UPDATE dbMetadata SET value = '159' WHERE name = 'schema-patch-level';