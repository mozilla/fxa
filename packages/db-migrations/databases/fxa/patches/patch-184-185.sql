SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('184');

-- Create the 'passkeys' table for WebAuthn/FIDO2 passkey credentials.
-- Each passkey is uniquely identified by credentialId and associated with a user (uid).
-- The table stores the public key, signature counter, and metadata for each passkey.
CREATE TABLE passkeys (
    uid BINARY(16) NOT NULL,
    -- WebAuthn spec defines maximum credential ID length as 1023 bytes
    -- https://www.w3.org/TR/webauthn-3/#credential-id
    credentialId VARBINARY(1023) NOT NULL,
    publicKey BLOB NOT NULL,
    signCount INT UNSIGNED NOT NULL DEFAULT 0,
    transports VARCHAR(255),
    aaguid BINARY(16),
    name VARCHAR(255),
    createdAt BIGINT UNSIGNED NOT NULL,
    lastUsedAt BIGINT UNSIGNED NULL,
    backupEligible TINYINT(1) NOT NULL DEFAULT 0,
    backupState TINYINT(1) NOT NULL DEFAULT 0,
    prfEnabled TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (uid, credentialId),
    UNIQUE KEY idx_credentialId (credentialId),
    FOREIGN KEY (uid) REFERENCES accounts(uid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

UPDATE dbMetadata SET value = '185' WHERE name = 'schema-patch-level';
