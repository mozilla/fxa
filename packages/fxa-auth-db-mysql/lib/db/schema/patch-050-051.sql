-- Migration to copy account emails that are not on the emails table
-- Sets the email as the primary email for account
INSERT INTO emails(
        normalizedEmail,
        email,
        uid,
        emailCode,
        isVerified,
        isPrimary,
        createdAt
    )
SELECT
    normalizedEmail,
    email,
    uid,
    emailCode,
    emailVerified,
    true,
    createdAt
FROM accounts a
WHERE
    a.uid
NOT IN
    (SELECT uid FROM emails);

UPDATE dbMetadata SET value = '51' WHERE name = 'schema-patch-level';
