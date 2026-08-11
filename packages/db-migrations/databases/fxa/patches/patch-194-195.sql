SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('194');

-- Per-passkey envelope holding the PRF-wrapped recovery keypair and the
-- HPKE-sealed kB. One row per passkey that has sync keys wrapped to it.
--
-- Every crypto column is fixed-length, so each is BINARY of the exact size the
-- ciphersuite (DHKEM(P-521, HKDF-SHA512) / HKDF-SHA512 / AES-256-GCM) produces.
-- Sizes below were measured, not estimated. Changing the ciphersuite means a new
-- envelope version, not a widened column.
CREATE TABLE IF NOT EXISTS passkeyWraps (
    uid BINARY(16) NOT NULL,
    -- Variable by design: WebAuthn credential IDs are authenticator-chosen and
    -- opaque. Matches the passkeys table.
    credentialId VARBINARY(1023) NOT NULL,
    pkR BINARY(133) NOT NULL,                      -- uncompressed P-521 point: 0x04 || x(66) || y(66)
    -- Raw scalar, not PKCS#8: 66 is a ciphersuite constant, while PKCS#8's 241
    -- rests on every Web Crypto emitting an OPTIONAL field. A shorter export
    -- would be zero-padded into this fixed column and never open again.
    prfWrappedSkR BINARY(82) NOT NULL,             -- AES-256-GCM(raw skR scalar, Nsk 66) + 16B tag
    keyWrapIv BINARY(12) NOT NULL,                 -- AES-GCM nonce
    hpkeEncapsulatedSecret BINARY(133) NOT NULL,   -- RFC 9180 Nenc for DHKEM(P-521)
    hpkeSealedKb BINARY(48) NOT NULL,              -- 32B kB + 16B tag
    createdAt BIGINT UNSIGNED NOT NULL,
    updatedAt BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (uid, credentialId),
    FOREIGN KEY (uid, credentialId) REFERENCES passkeys(uid, credentialId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

UPDATE dbMetadata SET value = '195' WHERE name = 'schema-patch-level';
